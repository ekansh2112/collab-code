import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws, request) => {
  const url = new URL(request.url,"https://collab-code-uj27.onrender.com");
  const roomId = url.searchParams.get("room");
  console.log("roomId: %s", roomId);
  ws.roomId = roomId;
  ws.on("message", (data) => {
    // Broadcast to all other connected clients
    console.log("received: %s", data);
    wss.clients.forEach((client) => {
      if(client !== ws && client.readyState === 1 && roomId && client.roomId === roomId) {
        client.send(data)
      }
    });
  });
});
