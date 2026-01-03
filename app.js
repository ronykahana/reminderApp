// Import Express.js new
import express from "express";
import bodyParser from "body-parser";
import webhookRoutes from "./webhook.js";
import { sendTextMessage } from "./whatsapp.js";

// Import Express.js old
//const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000 || 1000;
const verifyToken = process.env.VERIFY_TOKEN;

//linking to airtable
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE;
const AIRTABLE_TABLE = "WhatsApp Logs";

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});


//Webhook Verification (Meta requirement)
app.get("/webhook", (req, res) => {
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
  try {
    const statuses =
      req.body?.entry?.[0]?.changes?.[0]?.value?.statuses;

    if (!statuses) {
      return res.sendStatus(200);
    }

    for (const status of statuses) {
      await logToAirtable({
        messageId: status.id,
        status: status.status,
        recipient: status.recipient_id,
        timestamp: status.timestamp,
        errors: status.errors ? JSON.stringify(status.errors) : ""
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

//Airtable Logger
async function logToAirtable(record) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`;

  const payload = {
    records: [
      {
        fields: {
          "Message ID": record.messageId,
          "Status": record.status,
          "Recipient": record.recipient,
          "Timestamp": new Date(record.timestamp * 1000).toISOString(),
          "Errors": record.errors
        }
      }
    ]
  };

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

