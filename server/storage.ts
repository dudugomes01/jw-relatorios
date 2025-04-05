import { activities, users, type User, type InsertUser, type Activity, type InsertActivity, type UpdateUser } from "@shared/schema";
import session from "express-session";
import Database from "better-sqlite3";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
const db = new Database("database.sqlite");

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT,
    lastName TEXT,
    role TEXT NOT NULL DEFAULT 'publicador'
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    hours DECIMAL(4,1) NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User | undefined>;
  createActivity(userId: number, activity: InsertActivity): Promise<Activity>;
  getActivities(userId: number): Promise<Activity[]>;
  getActivitiesByMonth(userId: number, year: number, month: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<void>; // Added deleteActivity function
  sessionStore: session.SessionStore;
}

export class SqliteStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = db.prepare(
      'INSERT INTO users (username, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?) RETURNING *' // Added firstName and lastName
    ).get(insertUser.username, insertUser.email, insertUser.password, insertUser.firstName, insertUser.lastName, 'publicador');
    return result;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    return db.prepare(
      'UPDATE users SET firstName = ?, lastName = ?, role = ? WHERE id = ? RETURNING *' // Added firstName and lastName
    ).get(updates.firstName, updates.lastName, updates.role, id);
  }

  async createActivity(userId: number, insertActivity: InsertActivity): Promise<Activity> {
    const result = db.prepare(
      'INSERT INTO activities (userId, type, hours, date, notes) VALUES (?, ?, ?, ?, ?) RETURNING *'
    ).get(userId, insertActivity.type, insertActivity.hours, new Date(insertActivity.date).toISOString(), insertActivity.notes);
    return result;
  }

  async getActivities(userId: number): Promise<Activity[]> {
    return db.prepare('SELECT * FROM activities WHERE userId = ? ORDER BY date DESC').all(userId);
  }

  async getActivitiesByMonth(userId: number, year: number, month: number): Promise<Activity[]> {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0).toISOString();
    return db.prepare(
      'SELECT * FROM activities WHERE userId = ? AND date >= ? AND date < ? ORDER BY date DESC'
    ).all(userId, startDate, endDate);
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
  }

  async deleteActivity(id: number): Promise<void> {
    await db.prepare('DELETE FROM activities WHERE id = ?').run(id);
  }
}

export const storage = new SqliteStorage();