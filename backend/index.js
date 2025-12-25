import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    // Broadcast to all other connected clients
    console.log('received: %s', data);
    wss.clients.forEach((client) => {
        console.log('-------->>>> ', client !== ws, client.readyState === 1);
        if (client !== ws && client.readyState === 1) {
            console.log('sending message to client');
          client.send(data);
        }
      });
  });
});