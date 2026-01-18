const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const users = {};

    io.on("connection", (socket) => {
        console.log("New user connected");
        socket.on("user joined", (data) => {
            users[socket.id] = data.user;
            io.emit("user list", Object.values(users));
            io.emit("user joined", data);
        });
        socket.on("user left", (data) => {
            delete users[socket.id];

            io.emit("user list", Object.values(users));

            io.emit("user left", data);
        });
        socket.on("chat message", (data) => {
                io.emit("chat message", data);
            });

        socket.on("disconnect", () => {
            if (users[socket.id]) {
                const name = users[socket.id];
                delete users[socket.id];

                io.emit("user list", Object.values(users));
                io.emit("user left", { user: name, time: new Date().toLocaleTimeString().slice(0,5) });
            }
            console.log("User disconnected");
        });
    });



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
