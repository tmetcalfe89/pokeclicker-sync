import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import syncRoutes from "./routes/syncRoutes.js";
import { config } from "./config.js";

export function createApp() {
  const app = express();

  const corsOptions = config.corsOrigins.length
    ? { origin: config.corsOrigins, credentials: false }
    : { origin: true, credentials: false };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/sync", syncRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
