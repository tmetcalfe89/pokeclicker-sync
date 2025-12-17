import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/local-storage-sync",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  corsOrigins: (process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean)
};
