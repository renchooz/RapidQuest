import express from "express";
import "dotenv/config";
import { connectDb } from "./lib/db.js";
import router from "./routes/message.js";
import cors from "cors";

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
app.listen(process.env.PORT, () => {
  console.log(`server is listning on ${process.env.PORT}`);
});
