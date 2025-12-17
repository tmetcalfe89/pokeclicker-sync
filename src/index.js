import { config } from "./config.js";
import { connectDatabase } from "./database.js";
import { createApp } from "./app.js";

async function start() {
  try {
    await connectDatabase();
    console.log("Connected to MongoDB");

    const app = createApp();
    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
