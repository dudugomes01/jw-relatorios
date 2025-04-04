import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { updateUserSchema, insertActivitySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // User profile routes
  app.put("/api/user", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    try {
      const userId = req.user.id;
      const userData = updateUserSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Activity routes
  app.post("/api/activities", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    try {
      const userId = req.user.id;
      const activityData = insertActivitySchema.parse(req.body);
      
      const newActivity = await storage.createActivity(userId, activityData);
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    const userId = req.user.id;
    const activities = await storage.getActivities(userId);
    res.json(activities);
  });

  app.get("/api/activities/month/:year/:month", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    const userId = req.user.id;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    
    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ message: "Ano ou mês inválido" });
    }
    
    const activities = await storage.getActivitiesByMonth(userId, year, month);
    res.json(activities);
  });

  app.get("/api/activities/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "ID de atividade inválido" });
    }
    
    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }
    
    // Check if activity belongs to user
    if (activity.userId !== req.user.id) {
      return res.status(403).json({ message: "Acesso não autorizado" });
    }
    
    res.json(activity);
  });

  const httpServer = createServer(app);
  return httpServer;
}
