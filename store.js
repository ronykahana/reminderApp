export function saveMessage(record) {
  console.log("SAVE:", record);
  // Airtable / DB insert here
}

export function updateMessage(messageId, updates) {
  console.log("UPDATE:", messageId, updates);
  // Airtable / DB update here
}

const memory = new Map();

export function getUserState(userId) {
  return memory.get(userId)?.state || "NEW";
}

export function setUserState(userId, state) {
  const record = memory.get(userId) || {};
  memory.set(userId, { ...record, state });
}

export function logMessage(data) {
  console.log("LOG:", data);
}
