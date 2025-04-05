
import { activities, users, type User, type InsertUser, type Activity, type InsertActivity, type UpdateUser } from "@shared/schema";
import session from "express-session";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sql } from "drizzle-orm";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User | undefined>;
  
  // Activity operations
  createActivity(userId: number, activity: InsertActivity): Promise<Activity>;
  getActivities(userId: number): Promise<Activity[]>;
  getActivitiesByMonth(userId: number, year: number, month: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class SqliteStorage implements IStorage {
  private db: Database.Database;
  sessionStore: session.SessionStore;

  constructor() {
    this.db = new Database("data.db");
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
      );
      
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        type TEXT,
        hours REAL,
        date TEXT,
        notes TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = this.db.prepare(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)"
    ).run(user.username, user.email, user.password, user.role || "user");
    
    return this.getUser(result.lastInsertRowid as number) as Promise<User>;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    const sets: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (sets.length === 0) return this.getUser(id);
    
    values.push(id);
    this.db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(...values);
    
    return this.getUser(id);
  }

  async createActivity(userId: number, activity: InsertActivity): Promise<Activity> {
    const result = this.db.prepare(
      "INSERT INTO activities (userId, type, hours, date, notes) VALUES (?, ?, ?, ?, ?)"
    ).run(userId, activity.type, activity.hours, activity.date, activity.notes);
    
    return this.getActivity(result.lastInsertRowid as number) as Promise<Activity>;
  }

  async getActivities(userId: number): Promise<Activity[]> {
    return this.db.prepare("SELECT * FROM activities WHERE userId = ?").all(userId) as Activity[];
  }

  async getActivitiesByMonth(userId: number, year: number, month: number): Promise<Activity[]> {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
    
    return this.db.prepare(
      "SELECT * FROM activities WHERE userId = ? AND date >= ? AND date <= ?"
    ).all(userId, startDate, endDate) as Activity[];
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.db.prepare("SELECT * FROM activities WHERE id = ?").get(id) as Activity | undefined;
  }
}

// Export singleton instance
export const storage = new SqliteStorage();
