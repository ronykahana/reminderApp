export async function sendTemplate(to, templateName) {
  const url = `https://graph.facebook.com/v23.0/${process.env.PHONE_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" }
      }
    })
  });

  return res.json();
}

