import { WebSocket, WebSocketServer } from "ws";
import InitializeDBConnection from "./config/database";
import logger from "./logger/logger";

(async () => {
  logger.info("Starting DB connection...");
  try {
    // await InitializeDBConnection(); //TODO: fix db host
    logger.info("Database connected successfully");
  } catch (err) {
    logger.error("Failed to connect to database:", err);
  }
})();

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws: WebSocket, request: Request) => {
  const urlString = request.url ?? "/";
  const url = new URL(urlString, "https://collab-code-uj27.onrender.com");
  const roomId = url.searchParams.get("room") ?? undefined;

  ws.roomId = roomId;

  ws.on("message", (data) => {
    wss.clients.forEach((client: WebSocket) => {
      if (
        client !== ws &&
        client.readyState === 1 &&
        roomId &&
        client.roomId === roomId
      ) {
        client.send(data);
      }
    });
  });
});
