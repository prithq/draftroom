import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"

const app = express()
app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(express.json())


app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
})

const rooms = new Map<string, Map<string, {
  userId: string
  name: string
  email: string
  color: string   
}>>()

const CURSOR_COLORS = [
  "#46CEE6", "#FF6B6B", "#51CF66",
  "#FF922B", "#CC5DE8", "#F06595"
]

const roomCode=new Map<string,string>()
const roomCanvas=new Map<string,any[]>()

function getRandomColor(): string {
  const index = Math.floor(Math.random() * CURSOR_COLORS.length)
  return CURSOR_COLORS[index]!
}

io.on("connection",(socket) => {
  console.log(`socket connected: ${socket.id}`)

  socket.on("join-room", ({ roomId, userId, name, email }) => {
    
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

    console.log(`${name} joined room ${roomId}`)


    io.to(roomId).emit("room-users", Array.from(roomUsers.values()))
    socket.emit("code-init",{code:roomCode.get(roomId)??""})
    socket.emit("canvas-init",{elements:roomCanvas.get(roomId)??[]})

  })


  
  socket.on("leave-room", ({ roomId }) => {
    handleLeave(socket, roomId)
  })

 
  socket.on("disconnect", () => {
    console.log(`socket disconnected: ${socket.id}`)

    // find which room this socket was in and clean up
    for (const [roomId, users] of rooms.entries()) {
      if (users.has(socket.id)) {
        handleLeave(socket, roomId)
        break
      }
    }
  })

  socket.on("cursor-move", ({ roomId, x, y }) => {
    const roomUsers = rooms.get(roomId)
    if (!roomUsers) return

    const user = roomUsers.get(socket.id)
    if (!user) return

//socket.to exclude the sender, we dont want the sender to have more messages

    socket.to(roomId).emit("cursor-update", {
      socketId: socket.id,
      userId: user.userId,
      name: user.name,
      color: user.color,
      x,
      y
    })
  })

  socket.on("code-change",({roomId,code})=>{

    roomCode.set(roomId,code)

    socket.to(roomId).emit("code-change",code)

  })

    socket.on("canvas-change",({roomId,elements})=>{

    roomCode.set(roomId,elements)

    socket.to(roomId).emit("code-change",elements)

  })


})

function handleLeave(socket: any, roomId: string) {
  socket.leave(roomId)

  const roomUsers = rooms.get(roomId)
  if (!roomUsers) return

  const user = roomUsers.get(socket.id)
  roomUsers.delete(socket.id)
 

  if (roomUsers.size === 0) {
     rooms.delete(roomId)
     roomCanvas.delete(roomId)
     roomCode.delete(roomId)
    console.log(`room ${roomId} is empty, cleaned up`)
  } else {
    
    io.to(roomId).emit("room-users", Array.from(roomUsers.values()))
    console.log(`${user?.name} left room ${roomId}`)
  }
}


const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`)
})