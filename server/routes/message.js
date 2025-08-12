import express from "express";
import {
  getMessages,
  sendMessage,
 
  
  getConversations
} from "../controller/messageController.js";

const router = express.Router();


router.get("/conversations", getConversations); 
router.post("/:to", sendMessage);
router.get("/:to", getMessages);


export default router;
