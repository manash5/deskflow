import cors from "cors";
import express from "express";
import { config } from "./config/env";
import { pingDb } from "./db/neon";
import { requireAuth } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { agentRouter } from "./routes/agent.routes";
import { authRouter } from "./routes/auth.routes";
import { customerRouter } from "./routes/customer.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { catalogRouter, publicChatRouter } from "./routes/public.routes";

export function createApp() {
  const app = express();
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", async (_req, res) => {
    const database = await pingDb().catch(() => false);
    res.json({ ok: true, database });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/catalog", catalogRouter);
  app.use("/api/public/chat", publicChatRouter);

  app.use("/api/dashboard", requireAuth, dashboardRouter);
  app.use("/api/customers", requireAuth, customerRouter);
  app.use("/api/agents", requireAuth, agentRouter);

  app.use(errorHandler);
  return app;
}
