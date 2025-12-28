import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

function SetUpWebSocket(){
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
}

export default SetUpWebSocket
