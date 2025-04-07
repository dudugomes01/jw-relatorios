import { activities, users, reminders, type User, type InsertUser, type Activity, type InsertActivity, type UpdateUser, type Reminder, type InsertReminder } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User | undefined>;
  createActivity(userId: number, activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: InsertActivity): Promise<Activity | undefined>;
  getActivities(userId: number): Promise<Activity[]>;
  getActivitiesByMonth(userId: number, year: number, month: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<void>; 
  createReminder(userId: number, reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: InsertReminder): Promise<Reminder | undefined>;
  getReminders(userId: number): Promise<Reminder[]>;
  getRemindersByMonth(userId: number, year: number, month: number): Promise<Reminder[]>;
  getReminder(id: number): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<void>;
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log("Tentando criar usuário no banco de dados:", JSON.stringify({
      ...insertUser,
      password: "***REDACTED***" // Não logar a senha no console
    }, null, 2));
    
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...insertUser,
          role: 'publicador' // Default role
        })
        .returning();
      
      console.log("Usuário criado com sucesso no banco:", user.id);
      return user;
    } catch (error) {
      console.error("Erro ao criar usuário no banco:", error);
      throw error;
    }
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createActivity(userId: number, insertActivity: InsertActivity): Promise<Activity> {
    console.log("Inserindo atividade para o usuário:", userId);
    
    // No drizzle, temos que usar os objetos de colunas diretamente
    const [activity] = await db
      .insert(activities)
      .values({
        type: insertActivity.type,
        hours: String(insertActivity.hours),
        date: insertActivity.date,
        notes: insertActivity.notes,
        userId: userId // Usando a propriedade no modelo (não o nome da coluna no banco)
      })
      .returning();
    
    return activity;
  }

  async getActivities(userId: number): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.date));
  }

  async getActivitiesByMonth(userId: number, year: number, month: number): Promise<Activity[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    return db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.userId, userId),
          gte(activities.date, startDate),
          lt(activities.date, endDate)
        )
      )
      .orderBy(desc(activities.date));
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));
    return activity;
  }

  async updateActivity(id: number, updateData: InsertActivity): Promise<Activity | undefined> {
    const [activity] = await db
      .update(activities)
      .set({
        type: updateData.type,
        hours: String(updateData.hours), // Convertendo para string
        date: updateData.date,
        notes: updateData.notes
      })
      .where(eq(activities.id, id))
      .returning();
    return activity;
  }

  async deleteActivity(id: number): Promise<void> {
    await db
      .delete(activities)
      .where(eq(activities.id, id));
  }

  async createReminder(userId: number, insertReminder: InsertReminder): Promise<Reminder> {
    console.log("Inserindo lembrete para o usuário:", userId);
    
    const [reminder] = await db
      .insert(reminders)
      .values({
        title: insertReminder.title,
        date: insertReminder.date,
        description: insertReminder.description,
        userId: userId
      })
      .returning();
    
    return reminder;
  }

  async getReminders(userId: number): Promise<Reminder[]> {
    return db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(desc(reminders.date));
  }

  async getRemindersByMonth(userId: number, year: number, month: number): Promise<Reminder[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    return db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, userId),
          gte(reminders.date, startDate),
          lt(reminders.date, endDate)
        )
      )
      .orderBy(desc(reminders.date));
  }

  async getReminder(id: number): Promise<Reminder | undefined> {
    const [reminder] = await db
      .select()
      .from(reminders)
      .where(eq(reminders.id, id));
    return reminder;
  }

  async updateReminder(id: number, updateData: InsertReminder): Promise<Reminder | undefined> {
    const [reminder] = await db
      .update(reminders)
      .set({
        title: updateData.title,
        date: updateData.date,
        description: updateData.description
      })
      .where(eq(reminders.id, id))
      .returning();
    return reminder;
  }

  async deleteReminder(id: number): Promise<void> {
    await db
      .delete(reminders)
      .where(eq(reminders.id, id));
  }
}

export const storage = new DatabaseStorage();