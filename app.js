// Import Express.js new
import express from "express";
import bodyParser from "body-parser";
import webhookRouter from "./webhook.js";
import sendRouter from "./send.js";
import { sendTextMessage } from "./whatsapp.js";

// Import Express.js old
//const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
//app.use("/webhook", webhookRouter);
app.use("/", webhookRouter);
app.use("/send", sendRouter);
app.get("/", (_, res) => res.send("WhatsApp bot running"));

app.post("/", async (req, res) => {
  console.log("📫 Root webhook hit");
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Set port and verify_token
const port = process.env.PORT || 3000 ;
const verifyToken = process.env.VERIFY_TOKEN;

app.listen(port, () => console.log(`🚀 Server running on ${port}`));

//linking to airtable
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE;
const AIRTABLE_TABLE = "WhatsApp Logs";


// Route for GET requests
app.get('/', (req, res) => {
console.log("🫳 Route for GET requests");
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});


app.post("/", async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`📫 Webhook received ${timestamp}`);
    console.log(JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    // Ignore non-message events (statuses, etc.)
    if (!message) {
      return res.sendStatus(200);
    }
    let msg_body;
    if(message.type === "button"){
      msg_body = message.button.text;
    }else{
      msg_body = message.text?.body;
    };

    const logPayload = {
      direction: "inbound",
      phone: message.from,
      messageId: message.id,
      type: message.type,
      body: message.text?.body || "",
      status: message.statuses[0]?.status || "received",
      raw: req.body,
      recipient: message.statuses[0]?.recipient_id || "",
      context: JSON.stringify(message?.context) || ""
    };

    await logToAirtable(logPayload);

    console.log("✅ Inbound WhatsApp message logged");
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Failed to log inbound message", err);
    res.sendStatus(200); // ALWAYS ACK WhatsApp
  }
});




//Webhook Verification (Meta requirement)
app.get("/webhook", (req, res) => {
console.log("🪝 Webhook Verification (Meta requirement)");
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});


//Webhook Receiver → Airtable
app.post("/webhook", async (req, res) => {
console.log("🎁 Webhook Receiver → Airtable");
  try {
    const statuses =
      req.body?.entry?.[0]?.changes?.[0]?.value?.statuses;

    if (!statuses) {
      return res.sendStatus(200);
    }
  console.log("For status of stauses loop");
    for (const status of statuses) {
  console.log(status);
      await logToAirtable({
        messageId: status.id,
        status: status.status,
        recipient: status.recipient_id,
        errors: status.errors ? JSON.stringify(status.errors) : ""
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

// console.log("🧪 test-123 from 15555555555");
// //test
// import { logToAirtable } from "./airtable.js";

// logToAirtable({
//   direction: "test",
//   phone: "+15555555555",
//   messageId: "test-123",
//   type: "text",
//   body: "Hello test",
//   status: "ok",
//   raw: { hello: "world" }
// });

