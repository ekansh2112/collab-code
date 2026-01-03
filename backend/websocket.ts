import WebSocket, { WebSocketServer } from "ws";
interface CustomWebSocket extends WebSocket {
  roomId?: string | null;
}
const wss = new WebSocketServer({ port:  Number(process.env.WEBSOCKET_PORT) || 3001 });

function SetUpWebSocket() {
  wss.on("connection", (ws: CustomWebSocket, request) => {

    const baseUrl = process.env.WEBSOCKET_BASE_URL ?? "http://localhost:3001";
    const url = new URL(request.url ?? "/", baseUrl);

    const roomId = url.searchParams.get("room");
    ws.roomId = roomId;

    ws.on("message", (data) => {
      wss.clients.forEach((client) => {
        const c = client as CustomWebSocket;

        if (
          c !== ws &&
          c.readyState === WebSocket.OPEN &&
          roomId &&
          c.roomId === roomId
        ) {
          c.send(data);
        }
      });
    });
  });
}


export default SetUpWebSocket
