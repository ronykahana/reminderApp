export const STATES = {
  NEW: "NEW",
  WAITING_NAME: "WAITING_NAME",
  READY: "READY"
};

export function nextState(currentState, incomingText) {
  switch (currentState) {
    case STATES.NEW:
      return {
        next: STATES.WAITING_NAME,
        reply: "Hi! 👋 What’s your name?"
      };

    case STATES.WAITING_NAME:
      return {
        next: STATES.READY,
        reply: `Nice to meet you, ${incomingText}! How can I help you today?`
      };

    case STATES.READY:
      return {
        next: STATES.READY,
        reply: "Got it 👍 Tell me more."
      };

    default:
      return {
        next: STATES.NEW,
        reply: "Let’s start over 🙂"
      };
  }
}
