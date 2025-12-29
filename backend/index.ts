import express from "express";
import InitializeDBConnection from "./config/database.ts";
import logger from "./logger/logger.ts";
import SetUpWebSocket from "./websocket.ts";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    logger.info("Starting database connection...");
    await InitializeDBConnection();
    logger.info("Database connected successfully");

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    SetUpWebSocket();
    logger.info("WebSocket setup successfully");

  } catch (err) {
    logger.error("Server startup failed", err);
    process.exit(1);
  }
}

startServer();
