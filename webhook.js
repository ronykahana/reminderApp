import express from "express";
import { sendTextMessage } from "./whatsapp.js";
import { logToAirtable } from "./airtable.js";

const webhookRouter = express.Router();

webhookRouter.get("/", (req, res) => {
  res.send("Webhook alive");
});

webhookRouter.post("/", async (req, res) => {
  console.log("📩 Webhook hit", JSON.stringify(req.body, null, 2));
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  const message = value?.messages?.[0];
  if (value?.messages?.length) {
      const message = value.messages[0];
    
      console.log("🚁 Incoming message:", from, message.text?.body);
    
      await logToAirtable({
        direction: "inbound",
        phone: message.from,
        messageId: message.id,
        type: message.type,
        body: message.text?.body || "",
        status: "received",
        recipient: message.metadata?.phone_number_id || "",
        raw: req.body
      });

      console.log("✅ Inbound message logged");
    }
  // 2️⃣ OUTBOUND DELIVERY STATUS (FAILED / SENT / DELIVERED / READ)
    if (value?.statuses?.length) {
      const status = value.statuses[0];
      const error = status.errors?.[0];

      await logToAirtable({
        direction: "outbound",
        phone: status.recipient_id,
        messageId: status.id,
        type: "status",
        errors: error ? `${error.title}: ${error.message}` : status.status,
        status: status.status, // failed | sent | delivered | read
        body: message.text?.body,
        raw: req.body
      });

      console.log(`📦 Outbound status logged: ${status.status}`);
    }
    }
  }

  res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook processing failed", err);
    res.sendStatus(200); // Always ACK WhatsApp
  }
});

export default webhookRouter;
