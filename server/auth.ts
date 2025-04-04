import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

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
  try {
    // Validar formato de contraseña almacenada
    const parts = stored.split(".");
    if (parts.length !== 2) {
      console.error("Formato de contraseña incorrecto");
      return false;
    }
    
    const [hashed, salt] = parts;
    if (!hashed || !salt) {
      console.error("Formato de contraseña incorrecto: falta hash o salt");
      return false;
    }
    
    // Convertir hash almacenado a Buffer
    const hashedBuf = Buffer.from(hashed, "hex");
    
    // Generar hash de la contraseña proporcionada con la misma sal
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    // Comparar los dos hashes de manera segura contra ataques de tiempo
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error al comparar contraseñas:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "le-unique-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 semana
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }
        
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }
        
        if (!user.active) {
          return done(null, false, { message: "Usuario inactivo. Contacta al administrador." });
        }
        
        return done(null, user);
      } catch (error) {
        console.error("Error en autenticación:", error);
        return done(error);
      }
    }),
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
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "El nombre de usuario ya existe" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        active: true,
        role: req.body.role || "vendor", // Default to vendor if not specified
      });

      // No iniciar sesión automáticamente al registrar desde el dashboard
      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || "Credenciales inválidas"
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Eliminar la contraseña antes de enviar la respuesta
        const userResponse = { ...user };
        delete userResponse.password;
        
        return res.status(200).json(userResponse);
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
    res.json(req.user);
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "No autorizado" });
  };

  // Middleware to check if user is admin
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && (req.user.role === "admin" || req.user.role === "super_admin")) {
      return next();
    }
    res.status(403).json({ message: "Acceso prohibido" });
  };

  // Middleware to check if user is super admin
  const isSuperAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "super_admin") {
      return next();
    }
    res.status(403).json({ message: "Acceso prohibido" });
  };

  // Export middleware for use in routes
  return {
    isAuthenticated,
    isAdmin,
    isSuperAdmin
  };
}
