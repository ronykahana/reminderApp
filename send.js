import express from "express";
import { sendTextMessage } from "./whatsapp.js";
import { logToAirtable } from "./airtable.js";
import {sendTemplateMessage} from "./whatsapp.js";

const sendRouter = express.Router();

sendRouter.post("/", async (req, res) => {
  const { to, text, source = "Airtable" } = req.body;

  try {
    const result = await sendTextMessage(to, text);
    const messageId = result.messages?.[0]?.id;
    const context = result.messages?.[0]?.context;
    const messageType = result.messages?.[0]?.type;

    await logToAirtable({
      direction: "outbound",
      phone: "App",
      messageId: messageId,
      type: messageType || "text",
      body: text,
      status: message.statuses[0]?.status || "sent",
      raw: source,
      recipient: to,
      context:  JSON.stringify(context) || ""
      //Timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Send failed" });
  }
});

export default sendRouter;
