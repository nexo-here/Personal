const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    aliases: ["ask", "gpt4"],
    version: "1.0",
    author: "Cliffvincent & Nexo",
    shortDescription: "Ask GPT-4 Omni anything",
    longDescription: "Sends a prompt to GPT-4 API and replies with AI response (text only).",
    category: "ai",
    guide: "{pn} <your question>",
    usages: "{pn} what is quantum computing?"
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("❌ Please provide a question or prompt.", event.threadID, event.messageID);

    try {
      const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/gpt4?ask=${encodeURIComponent(prompt)}`);
      const { content } = res.data;

      return api.sendMessage(`${content}`, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to connect to GPT-4 API.", event.threadID, event.messageID);
    }
  }
};
