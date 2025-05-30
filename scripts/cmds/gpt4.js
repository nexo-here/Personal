const axios = require("axios");

module.exports = {
  config: {
    name: "gpt4",
    aliases: ["chatgpt", "askgpt", "gptai"],
    version: "1.0",
    author: "nexo_here",
    countDown: 5,
    role: 0,
    shortDescription: "Chat with GPT-4 AI",
    longDescription: "Ask anything to GPT-4 AI and get intelligent responses",
    category: "ai",
    guide: {
      en: "{pn} <your question>"
    }
  },

  langs: {
    en: {
      noInput: "⚠️ Please provide a question or prompt.",
      loading: "💬 Thinking with GPT-4...",
      error: "❌ Failed to get a response from GPT-4 API."
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply(getLang("noInput"));

    message.reply(getLang("loading"));

    try {
      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/gpt4?ask=${encodeURIComponent(prompt)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.content) return message.reply(getLang("error"));

      return message.reply(`🤖 GPT-4: ${res.data.content}`);
    } catch (err) {
      console.error("GPT-4 API Error:", err.message || err);
      return message.reply(getLang("error"));
    }
  }
};
