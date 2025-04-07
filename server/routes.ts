import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { UserRole, updateUserSchema, insertActivitySchema, insertReminderSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { Router } from 'express'; // Import express.Router

// ID de usuário de demonstração, usado para todas as operações
const DEMO_USER_ID = 1;

// Garantir que o usuário demo existe
async function ensureDemoUser() {
  let demoUser = await storage.getUser(DEMO_USER_ID);

  if (!demoUser) {
    console.log("Criando usuário de demonstração...");
    try {
      demoUser = await storage.createUser({
        username: "demo",
        password: "password", // Não será usado, apenas para o schema
        email: "demo@example.com",
        firstName: "João",
        lastName: "Silva"
      });

      // Atualizar o papel após criar
      if (demoUser) {
        demoUser = await storage.updateUser(demoUser.id, {
          role: UserRole.PIONEIRO_REGULAR
        });
      }

      console.log("Usuário de demonstração criado:", demoUser?.id);
    } catch (error) {
      console.error("Erro ao criar usuário demo:", error);
    }
  }

  return demoUser;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Certifica-se que o usuário demo existe
  const demoUser = await ensureDemoUser();

  const router = Router(); // Initialize the router

  // Get activities for service year
  router.get('/activities/year/:year/:month', async (req, res) => {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ message: "Ano ou mês inválido" });
    }

    try {
      const activities = await storage.getActivitiesByYearMonth(DEMO_USER_ID, year, month);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: "Erro ao buscar atividades" });
    }
  });


  app.use('/api', router); // Use the router for /api routes

  // Retorna o usuário demo (sem autenticação)
  app.get("/api/user", async (req, res) => {
    const user = await storage.getUser(DEMO_USER_ID);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Remove senha do retorno
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // User profile routes (usando usuário demo)
  app.put("/api/user", async (req, res, next) => {
    try {
      const userData = updateUserSchema.parse(req.body);

      const updatedUser = await storage.updateUser(DEMO_USER_ID, userData);
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

  // Activity routes (usando usuário demo)
  app.post("/api/activities", async (req, res, next) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);

      const newActivity = await storage.createActivity(DEMO_USER_ID, activityData);
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
    const activities = await storage.getActivities(DEMO_USER_ID);
    res.json(activities);
  });

  app.get("/api/activities/month/:year/:month", async (req, res) => {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ message: "Ano ou mês inválido" });
    }

    const activities = await storage.getActivitiesByMonth(DEMO_USER_ID, year, month);
    res.json(activities);
  });

  app.get("/api/activities/:id", async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "ID de atividade inválido" });
    }

    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    // Ainda checamos se a atividade pertence ao usuário demo
    if (activity.userId !== DEMO_USER_ID) {
      return res.status(403).json({ message: "Acesso não autorizado" });
    }

    res.json(activity);
  });

  app.put("/api/activities/:id", async (req, res, next) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "ID de atividade inválido" });
      }

      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }

      if (activity.userId !== DEMO_USER_ID) {
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
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "ID de atividade inválido" });
    }

    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    if (activity.userId !== DEMO_USER_ID) {
      return res.status(403).json({ message: "Acesso não autorizado" });
    }

    await storage.deleteActivity(activityId);
    res.sendStatus(200);
  });

  // Rotas para lembretes
  app.post("/api/reminders", async (req, res, next) => {
    try {
      const reminderData = insertReminderSchema.parse(req.body);

      const newReminder = await storage.createReminder(DEMO_USER_ID, reminderData);
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
    const reminders = await storage.getReminders(DEMO_USER_ID);
    res.json(reminders);
  });

  app.get("/api/reminders/month/:year/:month", async (req, res) => {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ message: "Ano ou mês inválido" });
    }

    const reminders = await storage.getRemindersByMonth(DEMO_USER_ID, year, month);
    res.json(reminders);
  });

  app.get("/api/reminders/:id", async (req, res) => {
    const reminderId = parseInt(req.params.id);
    if (isNaN(reminderId)) {
      return res.status(400).json({ message: "ID de lembrete inválido" });
    }

    const reminder = await storage.getReminder(reminderId);
    if (!reminder) {
      return res.status(404).json({ message: "Lembrete não encontrado" });
    }

    if (reminder.userId !== DEMO_USER_ID) {
      return res.status(403).json({ message: "Acesso não autorizado" });
    }

    res.json(reminder);
  });

  app.put("/api/reminders/:id", async (req, res, next) => {
    try {
      const reminderId = parseInt(req.params.id);
      if (isNaN(reminderId)) {
        return res.status(400).json({ message: "ID de lembrete inválido" });
      }

      const reminder = await storage.getReminder(reminderId);
      if (!reminder) {
        return res.status(404).json({ message: "Lembrete não encontrado" });
      }

      if (reminder.userId !== DEMO_USER_ID) {
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
    const reminderId = parseInt(req.params.id);
    if (isNaN(reminderId)) {
      return res.status(400).json({ message: "ID de lembrete inválido" });
    }

    const reminder = await storage.getReminder(reminderId);
    if (!reminder) {
      return res.status(404).json({ message: "Lembrete não encontrado" });
    }

    if (reminder.userId !== DEMO_USER_ID) {
      return res.status(403).json({ message: "Acesso não autorizado" });
    }

    await storage.deleteReminder(reminderId);
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}