import express from "express"
import {Server} from "socket.io"
import http from "http"

const app=express()

const server=http.createServer(app)

const io=new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        credentials:true
    }
})

io.on("conncection",(socket)=>{

    socket.on("message",(data: any)=>{
        io.emit("message",data)
    })

    socket.on("disconnect",()=>{

    })
})


server.listen(3001,()=>{
    console.log("server running at port 3001")
})