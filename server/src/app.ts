
export interface User { id: string; name: string }
export interface Message { content: string; username: string }

import express from "express"
import http from "http"
import {Server} from "socket.io"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

let users: User[] = []
let messages: Message[] = []

io.on('connection', (socket) => {
    
    socket.on('response_new_connection', (data) => {
    
        io.emit('new_user', {name: data.name})
        users.push({id: socket.id, name: data.name})
        socket.emit('messages', {messages})
    
    })
    
    socket.on('request_new_message', (data) => {
        const user = users.find(u => u.id == data.id)
        if(!user) return;
        messages.push({content: data.content, username: user.name})        
        io.emit('response_new_message', {content: data.content, username: user.name})
    })
    
    io.on('disconnect', () => {
        users = users.filter(u => u.id != socket.id);
    })
    
    console.log(`New connection: ${socket.id}`)
})


server.listen(3001, () => {
    console.log("Server running on *:3001")
})