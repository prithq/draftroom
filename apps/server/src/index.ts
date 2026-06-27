import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"

// ── 1. Express app ───────────────────────────────────────────────
const app = express()
app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(express.json())

// health check — so we can ping the server and confirm it's alive
app.get("/health", (_, res) => {
  res.json({ status: "ok" })
})

// ── 2. HTTP server ───────────────────────────────────────────────
// Socket.io can't attach directly to Express — it needs a raw HTTP server
// so we wrap Express in one
const httpServer = createServer(app)

// ── 3. Socket.io server ──────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
})

// ── 4. In-memory room state ──────────────────────────────────────
// This tracks who is currently connected in each room
// Key = roomId, Value = Map of socketId → user info
const rooms = new Map<string, Map<string, {
  userId: string
  name: string
  email: string
  color: string   // random color for their cursor
}>>()

// each user gets a random color for their cursor indicator
const CURSOR_COLORS = [
  "#46CEE6", "#FF6B6B", "#51CF66",
  "#FF922B", "#CC5DE8", "#F06595"
]

function getRandomColor(): string {
  const index = Math.floor(Math.random() * CURSOR_COLORS.length)
  return CURSOR_COLORS[index]!
}

// ── 5. Connection handler ────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 socket connected: ${socket.id}`)

  // ── Event: join-room ─────────────────────────────────────────
  // Fired when a user opens a room page
  // payload: { roomId, userId, name, email }
  socket.on("join-room", ({ roomId, userId, name, email }) => {
    // Socket.io has a concept of "rooms" built in
    // joining a room means this socket will receive all events emitted to that room
    socket.join(roomId)

    // if this is the first person in the room, create the map
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map())
    }

    // store this user's info against their socketId
    const roomUsers = rooms.get(roomId)!
    roomUsers.set(socket.id, {
      userId,
      name,
      email,
      color: getRandomColor()
    })

    console.log(`👤 ${name} joined room ${roomId}`)

    // tell everyone in the room (including the new user) 
    // the full updated list of who's here
    // "to(roomId)" = emit only to sockets that joined this room
    io.to(roomId).emit("room-users", Array.from(roomUsers.values()))
  })

  // ── Event: leave-room ────────────────────────────────────────
  // Fired when a user explicitly leaves
  socket.on("leave-room", ({ roomId }) => {
    handleLeave(socket, roomId)
  })

  // ── Event: disconnect ────────────────────────────────────────
  // Fired automatically when browser tab closes or connection drops
  socket.on("disconnect", () => {
    console.log(`❌ socket disconnected: ${socket.id}`)

    // find which room this socket was in and clean up
    for (const [roomId, users] of rooms.entries()) {
      if (users.has(socket.id)) {
        handleLeave(socket, roomId)
        break
      }
    }
  })

  // ── Event: cursor-move ───────────────────────────────────────
  // Fired when a user moves their mouse on the whiteboard
  // payload: { roomId, x, y }
  socket.on("cursor-move", ({ roomId, x, y }) => {
    const roomUsers = rooms.get(roomId)
    if (!roomUsers) return

    const user = roomUsers.get(socket.id)
    if (!user) return

    // broadcast to everyone in the room EXCEPT the sender
    // "socket.to" vs "io.to" — socket.to excludes the sender, io.to includes them
    socket.to(roomId).emit("cursor-update", {
      socketId: socket.id,
      userId: user.userId,
      name: user.name,
      color: user.color,
      x,
      y
    })
  })
})

// ── 6. Helper: handle a user leaving a room ──────────────────────
function handleLeave(socket: any, roomId: string) {
  socket.leave(roomId)

  const roomUsers = rooms.get(roomId)
  if (!roomUsers) return

  const user = roomUsers.get(socket.id)
  roomUsers.delete(socket.id)

  // if room is now empty, clean it up from memory
  if (roomUsers.size === 0) {
    rooms.delete(roomId)
    console.log(`🗑️  room ${roomId} is empty, cleaned up`)
  } else {
    // tell remaining users someone left
    io.to(roomId).emit("room-users", Array.from(roomUsers.values()))
    console.log(`👋 ${user?.name} left room ${roomId}`)
  }
}

// ── 7. Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`)
})