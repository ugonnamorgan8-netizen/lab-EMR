import fs from "node:fs";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { adminRouter } from "./routes/adminRoutes.js";
import { config } from "./config.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { authRouter } from "./routes/authRoutes.js";
import { billingRouter } from "./routes/billingRoutes.js";
import { catalogRouter } from "./routes/catalogRoutes.js";
import { notificationRouter } from "./routes/notificationRoutes.js";
import { patientRouter } from "./routes/patientRoutes.js";
import { sampleRouter } from "./routes/sampleRoutes.js";
import { visitRouter } from "./routes/visitRoutes.js";
import { workflowRouter } from "./routes/workflowRoutes.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  // When CLIENT_URL is set (e.g. separate frontend deployment), enforce the
  // allow-list plus localhost for dev. When CLIENT_URL is blank (same-origin
  // deployment such as Hugging Face Spaces), leave the set empty so that the
  // allowedOrigins.size === 0 branch permits every origin — the app and its
  // API are already on the same host, so CORS is purely advisory here.
  const allowedOrigins = config.clientUrl
    ? new Set<string>([config.clientUrl, "http://localhost:3000", "http://localhost:5173"])
    : new Set<string>();
  const clientDistCandidates = [
    path.resolve(process.cwd(), "client", "dist"),
    path.resolve(process.cwd(), "..", "client", "dist"),
  ];
  const clientDistPath =
    clientDistCandidates.find((candidatePath) => fs.existsSync(candidatePath)) ??
    clientDistCandidates[0];
  const hasBuiltClient = fs.existsSync(clientDistPath);

  const corsMiddleware = cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  });

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
      frameguard: false,
    })
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(cookieParser());
  // CORS only on API routes — static assets are same-origin and must not be
  // blocked by the origin allow-list check that Vite's crossorigin module
  // scripts trigger even for same-origin fetches.
  app.use("/api", corsMiddleware);
  app.use("/api", apiRateLimiter);

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/patients", requireAuth, patientRouter);
  app.use("/api/visits", requireAuth, visitRouter);
  app.use("/api/samples", requireAuth, sampleRouter);
  app.use("/api/invoices", requireAuth, billingRouter);
  app.use("/api/catalog", requireAuth, catalogRouter);
  app.use("/api/admin", requireAuth, adminRouter);
  app.use("/api/workflows", requireAuth, workflowRouter);
  app.use("/api/notifications", requireAuth, notificationRouter);

  if (hasBuiltClient) {
    app.use(express.static(clientDistPath));
    app.get(/^\/(?!api).*/, (_request, response) => {
      response.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use(errorHandler);

  return app;
}
