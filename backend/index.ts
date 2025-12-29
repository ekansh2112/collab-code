import { WebSocketServer } from "ws";
import InitializeDBConnection from './config/database.ts';

(async () => {
    console.log('Starting DB connection...');
    try {
        await InitializeDBConnection();
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Failed to connect to database:', err);
    }
})();
const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws, request) => {
  // const url = new URL(request.url,"http://localhost:3001");
  const url = new URL(request.url,"https://collab-code-uj27.onrender.com");
  const roomId = url.searchParams.get("room");
  ws.roomId = roomId;
  ws.on("message", (data) => {
    wss.clients.forEach((client) => {
      if(client !== ws && client.readyState === 1 && roomId && client.roomId === roomId) {
        client.send(data)
      }
    });
  });
});
