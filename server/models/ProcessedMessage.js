
import mongoose from "mongoose";

const processedMessageSchema = new mongoose.Schema({
  wa_id: String,
  from: String,
   to: String, 
  text: String,
  type: String,
  timestamp: String,
  status: { type: String, default: "pending" }, 
  messageId: { type: String, index: true }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ProcessedMessage", processedMessageSchema);
