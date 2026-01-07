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
    direction: "outbound",
    phone: data.messages?,
    messageId: data.messages?.[0]?.id,
    type: data.messages?.[0]? || "text",
    body: text,
    status: data.entry?.[0]?.statuses?.[0]?.status || "sent",
    raw: JSON.stringify(data),
    recipient: to,
    context: ""
  });

  
  return data; // ✅ now INSIDE function
}

export async function sendTemplateMessage(to, template,lan) {
const response = await fetch(
  `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: template,
        language: { code: lan }
      }
    })
  }
);
}
