import express from "express";
import { saveMessage, updateMessage } from "./store.js";

const router = express.Router();

router.post("/", (req, res) => {
  const value = req.body?.entry?.[0]?.changes?.[0]?.value;
  if (!value) return res.sendStatus(200);

  // Incoming messages (user → bot)
  if (value.messages) {
    value.messages.forEach(msg => {
      saveMessage({
        message_id: msg.id,
        direction: "inbound",
        from: msg.from,
        body: msg.text?.body,
        received_at: Date.now()
      });
    });
  }

  // Delivery status updates (bot → user)
  if (value.statuses) {
    value.statuses.forEach(status => {
      updateMessage(status.id, {
        status: status.status,
        [`${status.status}_at`]: Number(status.timestamp) * 1000
      });
    });
  }

  res.sendStatus(200);
});

export default router;

