import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer, host: "0.0.0.0" });

interface User {
  name: string;
  socket: WebSocket;
  room: string;
}

let rooms: Record<string, User[]> = {};

const genRoomId = (): string => {
  return (Math.random() * 1000000).toFixed() + Date.now().toString();
};

httpServer.on("request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); 
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); 

  if (req.method === "OPTIONS") {
    res.writeHead(204); 
    res.end();
    return;
  }
  if (req.method === "POST" && req.url === "/create-room") {
    const roomId = genRoomId();
    rooms[roomId] = [];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ roomId }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

wss.on("connection", (socket) => {
  socket.on("message", (msg) => {
    try {
      const parsedMsg = JSON.parse(msg.toString());

      if (parsedMsg.type === "join") {
        const { name, roomId } = parsedMsg.payload;
        console.log(name, roomId)
        if (!roomId || !rooms[roomId] || !name) {
          socket.send(
            JSON.stringify({
              error: "Invalid room id!",
            })
          );
          return;
        }

        rooms[roomId].push({ name, socket, room: roomId });
        console.log(`User joined ${roomId}`);
        socket.send(
          JSON.stringify({
            success: `Joined ${roomId}`,
          })
        );
      }

      if (parsedMsg.type === "chat") {
        console.log(rooms)
        const { roomId, message } = parsedMsg.payload;
        // console.log(roomId)
        if (!roomId || !rooms[roomId]) {
          socket.send(
            JSON.stringify({
              error: "Invalid room id!",
            })
          );
          return;
        }

        if (!message) {
          socket.send(
            JSON.stringify({
              error: "Must have to give some messsage!",
            })
          );
          return;
        }

        const sender = rooms[roomId].find((u) => u.socket === socket);
        if (!sender) {
          socket.send(
            JSON.stringify({
              error: "You are not part of this room!",
            })
          );
          return;
        }

        rooms[roomId].forEach((u) => {
          u.socket.send(
            JSON.stringify({
              from: sender.name,
              message,
            })
          );
        });
      }
    } catch (error) {
      console.error(error);
      socket.send(JSON.stringify({ error: "something went wrong!" }));
    }
  });

  socket.on("disconnect", () => {
    Object.keys(rooms).forEach((roomId) => {
      rooms[roomId] = rooms[roomId].filter((u) => u.socket !== socket);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    });
  });
});

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
