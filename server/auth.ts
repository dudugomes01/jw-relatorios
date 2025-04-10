import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-session-secret-for-development",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "identifier", // Allow login with username or email
        passwordField: "password",
      },
      async (identifier, password, done) => {
        try {
          // Try to find user by username or email
          let user = await storage.getUserByUsername(identifier);
          
          if (!user) {
            user = await storage.getUserByEmail(identifier);
          }
          
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Nome de usuário/email ou senha incorretos" });
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Recebido pedido de registro:", JSON.stringify(req.body, null, 2));
      
      // Validate input
      const userData = insertUserSchema.parse(req.body);
      console.log("Dados validados:", JSON.stringify(userData, null, 2));
      
      // Check if username exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        console.log("Nome de usuário já existe:", userData.username);
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }
      
      // Check if email exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        console.log("Email já está em uso:", userData.email);
        return res.status(400).json({ message: "Email já está em uso" });
      }

      console.log("Tentando criar usuário no storage");
      
      // Create new user with hashed password
      const hashedPassword = await hashPassword(userData.password);
      console.log("Senha com hash gerada");
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      console.log("Usuário criado com sucesso:", user.id);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Login the user after registration
      req.login(user, (err) => {
        if (err) {
          console.error("Erro ao fazer login após registro:", err);
          return next(err);
        }
        console.log("Login realizado após registro");
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Erro no registro:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.log("Erro de validação:", validationError.message);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message?: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
      }
      req.login(user, (err: Error | null) => {
        if (err) {
          return next(err);
        }
  
        // Remove password from response
        const { password, ...userWithoutPassword } = user as Express.User;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
