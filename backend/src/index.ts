import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";

// Initialize environment variables before importing configs
dotenv.config();

import db from "./config/database";
import { runMigrations } from "./database/migrate";
import { runSeeds } from "./database/seed";
import { errorHandler } from "./middlewares/errorHandler";

// Import Route Handlers
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import toolsRoutes from "./modules/tools/tools.routes";
import roadmapsRoutes from "./modules/roadmaps/roadmaps.routes";
import startupRoutes from "./modules/startup-validation/startup.routes";
import playgroundRoutes from "./modules/playground/playground.routes";
import blogRoutes from "./modules/blog/blog.routes";
import commentsRoutes from "./modules/comments/comments.routes";
import adminRoutes from "./modules/admin/admin.routes";

const app = express();
const server = http.createServer(app);
const corsOriginChecker = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return callback(null, true);
  const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
  if (isLocalhost || origin === process.env.APP_URL) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const io = new Server(server, {
  cors: {
    origin: corsOriginChecker,
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Apply Security and Request Parsing middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // for loading assets locally in dev
}));
app.use(cors({
  origin: corsOriginChecker,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session cookies parser helper
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Base Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Mount Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/tools", toolsRoutes);
app.use("/api/v1/roadmaps", roadmapsRoutes);
app.use("/api/v1/startup-validation", startupRoutes);
app.use("/api/v1/playground", playgroundRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/comments", commentsRoutes);
app.use("/api/v1/admin", adminRoutes);

// Apply Global Error Handler
app.use(errorHandler);

// WebSocket real-time namespace
const realtimeNamespace = io.of("/realtime");
let currentLiveViewers = 12; // Base live mock count

realtimeNamespace.on("connection", (socket) => {
  currentLiveViewers++;
  realtimeNamespace.emit("active:viewers", { count: currentLiveViewers });

  socket.on("subscribe:job", (data) => {
    // Simulate background worker progress ticks for roadmaps or validations
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      socket.emit(`job:progress:${data.jobId}`, { progress });
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 1000);
  });

  socket.on("disconnect", () => {
    currentLiveViewers = Math.max(1, currentLiveViewers - 1);
    realtimeNamespace.emit("active:viewers", { count: currentLiveViewers });
  });
});

// Bootstrap database and start listening
async function bootstrap() {
  try {
    // Run schema migrations
    await runMigrations();
    // Populate base records
    await runSeeds();

    server.listen(PORT, () => {
      console.log(`[Server] AzamjonBro API running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error("[Bootstrap] Database connection or initialization failed:", error);
    process.exit(1);
  }
}

bootstrap();
