import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  role: text("role").notNull().default(UserRole.PUBLICADOR),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  hours: decimal("hours", { precision: 4, scale: 1 }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
}).extend({
  username: z.string().min(3).max(20).regex(/^[a-z]+$/, {
    message: "Username must contain only lowercase letters without special characters"
  }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const updateUserSchema = createInsertSchema(users).pick({
  role: true,
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

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type User = typeof users.$inferSelect;
export type Activity = typeof activities.$inferSelect;
