import express from "express";
import { sendTextMessage } from "./whatsapp.js";
import { logToAirtable } from "./airtable.js";
import {sendTemplateMessage} from "./whatsapp.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { to, text, source = "Airtable" } = req.body;

  try {
    const result = await sendTextMessage(to, text);
    const messageId = result.messages?.[0]?.id;

    await logToAirtable({
      Direction: "sent",
      "Message ID": messageId,
      "Phone Number": to,
      "Message Body": text,
      "Message Type": "text",
      Source: source,
      Timestamp: new Date().toISOString()
    });

    res.json({ success: true, messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Send failed" });
  }
});

export default router;
