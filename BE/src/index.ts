import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 4000, host: "0.0.0.0" });

interface User {
  socket: WebSocket;
  room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (e) => {
    const parsedMsg = JSON.parse(e.toString());
    if (parsedMsg.type === "join") {
      allSockets.push({
        socket,
        room: parsedMsg.payload.roomId,
      });
    }

    if (parsedMsg.type === "chat") {
      const currRoomId = allSockets.find((s) => s.socket === socket)?.room;

      if (currRoomId) {
        allSockets
          .filter((s) => s.room === currRoomId)
          .forEach((person) => person.socket.send(parsedMsg.payload.message));
      }
    }
  });

  socket.on("disconnect", () => {
    allSockets = allSockets.filter((s) => s.socket != socket);
  });
});
