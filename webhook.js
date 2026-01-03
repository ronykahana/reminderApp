
import { logToAirtable } from "./airtable.js";
import { sendTextMessage } from "./whatsapp.js";
import express from "express";

const router = express.Router();

/**
 * Verification (Meta calls this once)
 */
router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/**
 * Incoming messages + status updates
 */
router.post("/", (req, res) => {
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  // Incoming user message
  const message = value?.messages?.[0];
  if (message) {
    const from = message.from;
    const text = message.text?.body;

    console.log("Incoming message:", from, text);

    // 👉 reply automatically
    await sendTextMessage(from, `You said: ${text}`);
  }

  // Delivery status updates
  const status = value?.statuses?.[0];
  if (status) {
    console.log("Message status:", status.status, status.id);
  }

  res.sendStatus(200);
});

export default router;


router.post("/", async (req, res) => {
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  // 📩 Incoming message
  const message = value?.messages?.[0];
  if (message) {
    const from = message.from;
    const body = message.text?.body || "";
    const messageId = message.id;

    console.log("Incoming:", from, body);

    // ✅ LOG RECEIVED MESSAGE
    await logToAirtable({
      direction: "received",
      phone: from,
      messageId,
      type: message.type,
      body,
      status: "",
      raw: message
    });

    // Optional auto-reply
    await sendTextMessage(from, `You said: ${body}`);
  }

  // 📦 Delivery status updates
  const status = value?.statuses?.[0];
  if (status) {
    await logToAirtable({
      direction: "status",
      phone: status.recipient_id,
      messageId: status.id,
      type: "",
      body: "",
      status: status.status,
      raw: status
    });
  }

  res.sendStatus(200);
});
