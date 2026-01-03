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
