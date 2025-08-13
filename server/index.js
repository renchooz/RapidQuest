import express from "express";
import "dotenv/config";
import { connectDb } from "./lib/db.js";
import router from "./routes/message.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();


app.use(express.json());
connectDb();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


app.use("/messages", router);


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: true, 
    credentials: true,
  },
});


io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("send_message", (data) => {
    console.log("Message received:", data);
    io.emit("receive_message", data); 
    console.log("receive_message", data); 

  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


server.listen(process.env.PORT, () => {
  console.log(`Server is listening on ${process.env.PORT}`);
});
