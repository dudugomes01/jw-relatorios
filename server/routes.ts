import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { UserRole, updateUserSchema, insertActivitySchema, insertReminderSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { Router } from 'express'; // Import express.Router


// Middleware para verificar autenticação e obter ID do usuário
function getUserId(req: any): number {
  if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.id) {
    console.log("Usando ID do usuário autenticado:", req.user.id);
    return req.user.id;
  }
  
  throw new Error("Usuário não autenticado");
}

export async function registerRoutes(app: Express): Promise<Server> {

  const router = Router(); 

  router.get("/user-role", async (req, res) => {
    try {
      // Verificar se o usuário está autenticado
      const userId = getUserId(req);
  
      // Buscar o usuário no banco de dados
      const user = await storage.getUser(userId);
      if (!user) {
        console.warn(`Usuário com ID ${userId} não encontrado.`);
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
  
      // Garantir que role é uma string válida
      const role = user.role ? String(user.role) : '';
      console.log(`Papel do usuário ${userId}: ${role} (tipo: ${typeof role})`);
  
      // Validar o papel do usuário
      const validRoles = Object.values(UserRole) as string[];
      if (!validRoles.includes(role)) {
        console.error(`Papel inválido encontrado para o usuário ${userId}: ${role}`);
        // Em vez de retornar erro, fornece um valor padrão
        return res.json({ role: UserRole.PUBLICADOR });
      }
  
      // Retornar o papel do usuário
      return res.json({ role });
    } catch (error) {
      // Tratar erros de autenticação
      if (error instanceof Error && error.message === "Usuário não autenticado") {
        console.warn("Tentativa de acesso não autenticada.");
        return res.status(401).json({ error: "Usuário não autenticado" });
      }
  
      // Logar outros erros e retornar erro genérico
      console.error("Erro ao buscar papel do usuário:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  router.get('/activities/year/:year/:month', async (req, res) => {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const userId = getUserId(req);

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ message: "Ano ou mês inválido" });
    }

    try {
      const activities = await storage.getActivitiesByYearMonth(userId, year, month);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: "Erro ao buscar atividades" });
    }
  });

  app.use('/api', router);

  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Usuário não autenticado"); 
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    
    try {
      const userId = req.user.id;
      // Buscar dados completos e atualizados do usuário
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      console.log("Usuário autenticado:", userWithoutPassword);
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // User profile routes (usando usuário autenticado)
  app.put("/api/user", async (req, res, next) => {
    try {
      const userId = getUserId(req);
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

  // Activity routes (usando usuário autenticado)
  app.post("/api/activities", async (req, res, next) => {
    try {
      const userId = getUserId(req);
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
    const userId = getUserId(req);
    const activities = await storage.getActivities(userId);
    res.json(activities);
  });

  app.get("/api/activities/month/:year/:month", async (req, res) => {
    const userId = getUserId(req);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ message: "Ano ou mês inválido" });
    }

    const activities = await storage.getActivitiesByMonth(userId, year, month);
    res.json(activities);
  });

  app.get("/api/activities/:id", async (req, res) => {
    const userId = getUserId(req);
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "ID de atividade inválido" });
    }

    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    // Verificar se a atividade pertence ao usuário autenticado
    if (activity.userId !== userId) {
      return res.status(403).json({ message: "Acesso não autorizado" });
    }

    res.json(activity);
  });

  app.put("/api/activities/:id", async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "ID de atividade inválido" });
      }

      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }

      if (activity.userId !== userId) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }

      const activityData = insertActivitySchema.parse(req.body);

      const updatedActivity = await storage.updateActivity(activityId, activityData);
      res.json(updatedActivity);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    const userId = getUserId(req);
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "ID de atividade inválido" });
    }

    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    if (activity.userId !== userId) {
      return res.status(403).json({ message: "Acesso não autorizado" });
    }

    await storage.deleteActivity(activityId);
    res.sendStatus(200);
  });

  // Rotas para lembretes
  app.post("/api/reminders", async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const reminderData = insertReminderSchema.parse(req.body);

      const newReminder = await storage.createReminder(userId, reminderData);
      res.status(201).json(newReminder);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.get("/api/reminders", async (req, res) => {
    const userId = getUserId(req);
    const reminders = await storage.getReminders(userId);
    res.json(reminders);
  });

  app.get("/api/reminders/month/:year/:month", async (req, res) => {
    const userId = getUserId(req);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ message: "Ano ou mês inválido" });
    }

    const reminders = await storage.getRemindersByMonth(userId, year, month);
    res.json(reminders);
  });

  app.get("/api/reminders/:id", async (req, res) => {
    const userId = getUserId(req);
    const reminderId = parseInt(req.params.id);
    if (isNaN(reminderId)) {
      return res.status(400).json({ message: "ID de lembrete inválido" });
    }

    const reminder = await storage.getReminder(reminderId);
    if (!reminder) {
      return res.status(404).json({ message: "Lembrete não encontrado" });
    }

    if (reminder.userId !== userId) {
      return res.status(403).json({ message: "Acesso não autorizado" });
    }

    res.json(reminder);
  });

  app.put("/api/reminders/:id", async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const reminderId = parseInt(req.params.id);
      if (isNaN(reminderId)) {
        return res.status(400).json({ message: "ID de lembrete inválido" });
      }

      const reminder = await storage.getReminder(reminderId);
      if (!reminder) {
        return res.status(404).json({ message: "Lembrete não encontrado" });
      }

      if (reminder.userId !== userId) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }

      const reminderData = insertReminderSchema.parse(req.body);

      const updatedReminder = await storage.updateReminder(reminderId, reminderData);
      res.json(updatedReminder);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.delete("/api/reminders/:id", async (req, res) => {
    const userId = getUserId(req);
    const reminderId = parseInt(req.params.id);
    if (isNaN(reminderId)) {
      return res.status(400).json({ message: "ID de lembrete inválido" });
    }

    const reminder = await storage.getReminder(reminderId);
    if (!reminder) {
      return res.status(404).json({ message: "Lembrete não encontrado" });
    }

    if (reminder.userId !== userId) {
      return res.status(403).json({ message: "Acesso não autorizado" });
    }

    await storage.deleteReminder(reminderId);
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}