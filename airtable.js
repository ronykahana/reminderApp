// //Airtable Logger
// export async function logToAirtable(record) {
//   const url = `https://api.airtable.com/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`;

//   const payload = {
//     records: [
//       {
//         fields: {
//           "Message ID": record.messageId,
//           "Status": record.status,
//           "Recipient": record.recipient,
//           "Timestamp": new Date(record.timestamp * 1000).toISOString(),
//           "Errors": record.errors
//         }
//       }
//     ]
//   };

//   await fetch(url, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${AIRTABLE_TOKEN}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(payload)
//   });
// }

export async function logToAirtable({
  direction,
  messageId,
  phone,
  body,
  type,
  status,
  raw
}) {
  const url = `https://api.airtable.com/${process.env.AIRTABLE_BASE}/${encodeURIComponent(process.env.AIRTABLE_TABLE_NAME)}`;

  const payload = {
    records: [
      {
        fields: {
          Timestamp: new Date().toISOString(),
          Direction: direction,
          "Phone Number": phone,
          "Message ID": messageId,
          "Message Type": type,
          "Message Body": body,
          Status: status,
          "Raw Payload": JSON.stringify(raw)
        }
      }
    ]
  };

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}
