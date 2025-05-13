const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    aliases: ["gpt", "cohere", "bot"],
    version: "1.0",
    author: "nexo_here",
    countDown: 3,
    role: 0,
    shortDescription: "AI chat with Cohere",
    longDescription: "Ask anything to AI using Cohere API",
    category: "ai",
    guide: {
      en: "{p}ai [your message]"
    }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("⚠️ | Please provide a prompt.");

    try {
      const res = await axios.post(
        "https://api.cohere.ai/v1/generate",
        {
          model: "command-r-plus",
          prompt: prompt,
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            "Authorization": "Bearer DvfNWwBvqtdYF6iXKUeOtUdqiJwSMIPRJo6KYkJh",
            "Content-Type": "application/json"
          }
        }
      );

      const reply = res.data.generations[0].text.trim();
      message.reply(reply || "❌ | No response from AI.");
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      message.reply("❌ | AI সার্ভারে সমস্যা হয়েছে।");
    }
  }
};
