import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port:  Number(process.env.WEBSOCKET_PORT) || 3001 });

function SetUpWebSocket(){
    wss.on("connection", (ws, request) => {
  // const url = new URL(request.url,"http://localhost:3001");
  const url = new URL(request.url,process.env.WEBSOCKET_BASE_URL);
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
