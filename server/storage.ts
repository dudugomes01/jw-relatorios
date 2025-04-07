import { activities, users, type User, type InsertUser, type Activity, type InsertActivity, type UpdateUser } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();