import { logToAirtable } from "./airtable.js";

export async function sendTextMessage(to, text) {
  const url = `https://graph.facebook.com/v24.0/${process.env.PHONE_ID}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  await logToAirtable({
    direction: "sent",
    phone: to,
    messageId: data.messages?.[0]?.id,
    type: "text",
    body: text,
    status: "sent",
    raw: data
  });

  return data; // ✅ now INSIDE function
}
