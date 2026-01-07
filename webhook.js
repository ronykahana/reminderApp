import express from "express";
import { sendTextMessage } from "./whatsapp.js";
import { logToAirtable } from "./airtable.js";

const webhookRouter = express.Router();

webhookRouter.get("/", (req, res) => {
  res.send("Webhook alive");
});

// webhookRouter.post("/", async (req, res) => {
//   try {
//     console.log("📩 Webhook hit", JSON.stringify(req.body, null, 2));
//     const entry = req.body.entry?.[0];
//     const change = entry?.changes?.[0];
//     const value = change?.value;
//     const msg = value?.messages?.[0];

//     if (!msg) return res.sendStatus(200);

//     const from = msg.from;
//     const text = msg.text?.body;

//     console.log("📩 Incoming:", from, text);

//     await logToAirtable({
//       direction: "received",
//       phone: from,
//       messageId: msg.id,
//       type: msg.type,
//       body: text,
//       status: "received",
//       raw: msg
//     });

//     await sendTextMessage(from, `You said: ${text}`);

//     res.sendStatus(200);
//   } catch (err) {
//     console.error("Webhook error:", err);
//     res.sendStatus(500);
//   }
// });

// import express from "express";
// import { sendTextMessage } from "./whatsapp.js";
// import { logToAirtable } from "./airtable.js";

// const router = express.Router();

webhookRouter.post("/", async (req, res) => {
  console.log("📩 Webhook hit", JSON.stringify(req.body, null, 2));
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  const message = value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body || "";
    const messageId = message.id;

    console.log("🚁 Incoming message:", from, text);
    
    await logToAirtable({
      direction: "received",
      phone: from,
      messageId: messageId,
      type: message.type,
      body: JSON.stringify(text),
      status: "",
      raw: message
    });

    //console.log("🚀 Sending reply to", from);
    // ✅ await is legal because we're inside async ()
    //await sendTextMessage(from, `You said: ${text}`);
  }

  res.sendStatus(200);
});

export default webhookRouter;
