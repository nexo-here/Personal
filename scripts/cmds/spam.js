module.exports = {
  config: {
    name: "spam",
    version: "1.0",
    author: "NEXXO",
    countDown: 3,
    role: 1,
    shortDescription: {
      en: "Send spam messages"
    },
    category: "fun",
    guide: {
      en: "{pn} <count> <message>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const count = parseInt(args[0]);
    const message = args.slice(1).join(" ");

    if (!count || isNaN(count) || count > 50) {
      return api.sendMessage("Usage: spam <count (max 50)> <message>", event.threadID);
    }

    if (!message) {
      return api.sendMessage("Please provide a message to spam.", event.threadID);
    }

    for (let i = 0; i < count; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Delay 100ms between messages
      api.sendMessage(message, event.threadID);
    }
  
  }
};