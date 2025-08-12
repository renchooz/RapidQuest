import fs from "fs";
import path from "path";
import "dotenv/config";
import { connectDb } from "../lib/db.js";
import ProcessedMessage from "../models/ProcessedMessage.js";

const __dirname = path.resolve();
const payloadDir = path.join(__dirname, "../payloads");

async function processPayload(payload) {
  const { metaData } = payload;
  if (!metaData?.entry) return;

  for (const entry of metaData.entry) {
    for (const change of entry.changes) {
      const value = change.value;

      
      if (value.messages) {
        for (const msg of value.messages) {
          const exists = await ProcessedMessage.findOne({ messageId: msg.id });
          if (!exists) {
            await ProcessedMessage.create({
              wa_id: value.contacts?.[0]?.wa_id,
              from: msg.from,
              text: msg.text?.body || "",
              type: msg.type,
              timestamp: msg.timestamp,
              messageId: msg.id
            });
            console.log(`✅ Inserted new message: ${msg.id}`);
          }
        }
      }

    
      if (value.statuses) {
        for (const statusUpdate of value.statuses) {
          const idToMatch = statusUpdate.id || statusUpdate.meta_msg_id;
          const updated = await ProcessedMessage.findOneAndUpdate(
            { messageId: idToMatch },
            { status: statusUpdate.status },
            { new: true }
          );

          if (updated) {
            console.log(`🔄 Updated status for ${idToMatch} → ${statusUpdate.status}`);
          } else {
            console.log(`⚠ No message found for status update: ${idToMatch}`);
          }
        }
      }
    }
  }
}

async function run() {
  await connectDb();

  const files = fs.readdirSync(payloadDir).filter(f => f.endsWith(".json"));
  for (const file of files) {
    const data = fs.readFileSync(path.join(payloadDir, file), "utf8");
    const payload = JSON.parse(data);
    console.log(`📂 Processing file: ${file}`);
    await processPayload(payload);
  }

  console.log("🎯 All payloads processed");
  process.exit();
}

run();
