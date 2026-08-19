// apps/server/src/index.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// In-memory storage
const rooms = new Map<string, Map<string, any>>();
const roomCode = new Map<string, string>();
const roomCanvas = new Map<string, any[]>();
const roomQuestion = new Map<string, any>(); // 
const roomLanguage = new Map<string, string>();

const CURSOR_COLORS = ["#46CEE6", "#FF6B6B", "#51CF66", "#FF922B", "#CC5DE8", "#F06595"];

function getRandomColor(): string {
  const index = Math.floor(Math.random() * CURSOR_COLORS.length);
  return CURSOR_COLORS[index]!;
}

io.on("connection", (socket) => {
  console.log(`socket connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, userId, name, email }) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const roomUsers = rooms.get(roomId)!;
    roomUsers.set(socket.id, {
      userId,
      name,
      email,
      color: getRandomColor(),
    });

    console.log(`${name} joined room ${roomId}`);

    io.to(roomId).emit("room-users", Array.from(roomUsers.values()));
    socket.emit("code-init", { code: roomCode.get(roomId) ?? "" });
    socket.emit("canvas-init", { elements: roomCanvas.get(roomId) ?? [] });
    
   
    const currentQuestion = roomQuestion.get(roomId);
    if (currentQuestion) {
      socket.emit("question-init", { question: currentQuestion });
    }
  });

  socket.on("leave-room", ({ roomId }) => {
    handleLeave(socket, roomId);
  });

  socket.on("disconnect", () => {
    console.log(`socket disconnected: ${socket.id}`);
    for (const [roomId, users] of rooms.entries()) {
      if (users.has(socket.id)) {
        handleLeave(socket, roomId);
        break;
      }
    }
  });

 
  socket.on("cursor-move", ({ roomId, x, y }) => {
    const roomUsers = rooms.get(roomId);
    if (!roomUsers) return;
    const user = roomUsers.get(socket.id);
    if (!user) return;
    socket.to(roomId).emit("cursor-update", {
      socketId: socket.id,
      userId: user.userId,
      name: user.name,
      color: user.color,
      x,
      y,
    });
  });

  // WebRTC Signaling
  socket.on("webrtc-offer", ({ roomId, offer, targetSocketId }) => {
    io.to(targetSocketId).emit("webrtc-offer", { offer, fromSocketId: socket.id });
  });

  socket.on("webrtc-answer", ({ roomId, answer, targetSocketId }) => {
    io.to(targetSocketId).emit("webrtc-answer", { answer, fromSocketId: socket.id });
  });

  socket.on("webrtc-ice", ({ roomId, candidate, targetSocketId }) => {
    io.to(targetSocketId).emit("webrtc-ice", {
      candidate,
      fromSocketId: socket.id,
    });
  });


  socket.on("code-change", ({ roomId, code }) => {
    roomCode.set(roomId, code);
    socket.to(roomId).emit("code-change", { code, fromSocketId: socket.id });
  });


  socket.on("canvas-change", ({ roomId, elements }) => {
    roomCanvas.set(roomId, elements);
    socket.to(roomId).emit("canvas-change", { elements, fromSocketId: socket.id });
  });

  socket.on("question-change", ({ roomId, question }) => {
    roomQuestion.set(roomId, question);
    socket.to(roomId).emit("question-update", { 
      question, 
      fromSocketId: socket.id 
    });
  });

  socket.on("language-change", ({ roomId, language }) => {
    roomLanguage.set(roomId, language);
    socket.to(roomId).emit("language-update", { 
      language, 
      fromSocketId: socket.id 
    });
  });

  function handleLeave(socket: any, roomId: string) {
    socket.leave(roomId);
    const roomUsers = rooms.get(roomId);
    if (!roomUsers) return;

    const user = roomUsers.get(socket.id);
    roomUsers.delete(socket.id);

    if (roomUsers.size === 0) {
      rooms.delete(roomId);
      roomCanvas.delete(roomId);
      roomCode.delete(roomId);
      roomQuestion.delete(roomId); 
      roomLanguage.delete(roomId);
      console.log(`room ${roomId} is empty, cleaned up`);
    } else {
      io.to(roomId).emit(
        "room-users",
        Array.from(roomUsers.entries()).map(([socketId, user]) => ({
          ...user,
          socketId,
        }))
      );
      console.log(`${user?.name} left room ${roomId}`);
    }
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});