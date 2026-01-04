import express from "express";
import { sendTextMessage } from "./whatsapp.js";
import { logToAirtable } from "./airtable.js";
import { logToAirtableSimple } from "./airtable.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  const message = value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body || "";
    const messageId = message.id;

    console.log("Incoming message:", from, text);

    await logToAirtable({
      direction: "received",
      phone: from,
      messageId: messageId,
      type: message.type,
      body: text,
      status: "",
      raw: message
    });

    // ✅ await is legal because we're inside async ()
    await sendTextMessage(from, `You said: ${text}`);
  }

  res.sendStatus(200);
});

export default router;
