export async function logToAirtable({
  direction,
  messageId,
  phone,
  body,
  type,
  status,
  raw,
  recipient,
  context,
  error
}) {
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE}/${encodeURIComponent(
    process.env.AIRTABLE_TABLE_NAME
  )}`;

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
          "Raw Payload": JSON.stringify(raw),
          Recipient: recipient || "",
          Context: context || "",
          Errors: error || ""
        }
      }
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Airtable log failed:", response.status, errorText);
  }
}
