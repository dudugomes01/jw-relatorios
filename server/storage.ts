import { activities, users, type User, type InsertUser, type Activity, type InsertActivity, type UpdateUser } from "@shared/schema";
import session from "express-session";
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activities: Map<number, Activity>;
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentActivityId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // One day in ms
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, role: "publicador" };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Activity methods
  async createActivity(userId: number, insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { ...insertActivity, id, userId };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivities(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getActivitiesByMonth(userId: number, year: number, month: number): Promise<Activity[]> {
    return (await this.getActivities(userId)).filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate.getFullYear() === year && activityDate.getMonth() === month;
    });
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
}

export const storage = new MemStorage();
