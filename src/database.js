import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDatabase() {
  const options = {
    serverSelectionTimeoutMS: 5000
  };

  await mongoose.connect(config.mongoUri, options);
}
