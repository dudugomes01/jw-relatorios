import { pgTable, text, serial, integer, boolean, timestamp, decimal, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User roles
export const UserRole = {
  PUBLICADOR: "publicador",
  PIONEIRO_AUXILIAR: "pioneiro-auxiliar",
  PIONEIRO_REGULAR: "pioneiro-regular",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Activity types
export const ActivityType = {
  CAMPO: "campo",
  TESTEMUNHO: "testemunho",
  CARTAS: "cartas",
  ESTUDO: "estudo",
} as const;

export type ActivityTypeType = typeof ActivityType[keyof typeof ActivityType];

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("firstName").notNull().default(""),
  lastName: text("lastName").notNull().default(""),
  role: text("role").notNull().default(UserRole.PUBLICADOR),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  hours: text("hours").notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
});

// Reminders table
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
  reminders: many(reminders)
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id]
  })
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id]
  })
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
}).extend({
  username: z.string().min(3).max(20).regex(/^[a-z]+$/, {
    message: "Username must contain only lowercase letters without special characters"
  }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  firstName: z.string().min(1, {message: "First Name is required"}),
  lastName: z.string().min(1, {message: "Last Name is required"}),
});

export const updateUserSchema = createInsertSchema(users).pick({
  role: true,
  firstName: true,
  lastName: true,
});

export const insertActivitySchema = createInsertSchema(activities)
  .pick({
    type: true,
    hours: true,
    date: true,
    notes: true,
  })
  .extend({
    type: z.enum([
      ActivityType.CAMPO,
      ActivityType.TESTEMUNHO,
      ActivityType.CARTAS,
      ActivityType.ESTUDO
    ], {
      errorMap: () => ({ message: "Tipo de atividade inválido" })
    }),
    hours: z.number()
      .min(0.5, "Mínimo de 0.5 horas")
      .max(24, "Máximo de 24 horas"),
    date: z.coerce.date(),
    notes: z.string().optional()
  });

export const insertReminderSchema = createInsertSchema(reminders)
  .pick({
    title: true,
    date: true,
    description: true,
  })
  .extend({
    title: z.string().min(1, { message: "Título é obrigatório" }),
    date: z.coerce.date(),
    description: z.string().optional()
  });

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type User = typeof users.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;