import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from 'http';
import { connect } from "./config.js";
import { chatModel } from "./chat.schema.js";

// 1. Create the app using Express
const app = express();
let users = [];

// 2. Create the HTTP server
const server = http.createServer(app);

// 3. Create the Socket server
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

let connectedUsers = 0;

// 4. Use Socket events
io.on('connection', (socket) => {
    console.log("Connection is established");

    socket.on('join', (data) => {
        socket.username = data;
        users.push(data);

        chatModel.find()
            .sort({ time: 1 })
            .limit(50)
            .then((messages) => {
                socket.emit('load_messages', messages);
                connectedUsers += 1;
                io.emit("newconnecteduser", connectedUsers);
                io.emit("addusername", users);
            })
            .catch((err) => {
                console.log(err);
            });
    });

    socket.on('new_message', (message) => {
        console.log("new message hits");

        message.username = socket.username;

        const newChat = new chatModel(message);
        newChat.save();

        socket.broadcast.emit('broadcast_message', message); 
    });

    socket.on('disconnect', () => {
        console.log("Connection is disconnected");
        connectedUsers -= 1;
        io.emit("newconnecteduser", connectedUsers);
        users = users.filter(user => user !== socket.username);
        io.emit("removeusername", users); 
    });
});

// 5. Start the server
server.listen(3000, () => {
    console.log("Server is listening on port 3000");
    connect();
});
