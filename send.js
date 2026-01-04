// const response = await fetch(
//   `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
//   {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${ACCESS_TOKEN}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       messaging_product: "whatsapp",
//       to: toPhone,
//       type: "template",
//       template: {
//         name: "your_template",
//         language: { code: "en_US" }
//       }
//     })
//   }
// );

// const data = await response.json();
// const messageId = data.messages?.[0]?.id;
import express from "express";
import { sendTextMessage } from "./whatsapp.js";
import { logToAirtable } from "./airtable.js";

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
