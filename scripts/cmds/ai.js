module.exports = {
  config: {
    name: "gpt",
    aliases: ["chat", "ai", "gemini"],
    version: "1.0",
    author: "nexo_here",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Chat with GPT via OpenRouter"
    },
    longDescription: {
      en: "Use OpenRouter to chat with GPT-3.5/4 (no OpenAI key needed)"
    },
    category: "ai",
    guide: {
      en: "{pn} your message"
    }
  },

  onStart: async function ({ api, event, args }) {
    const axios = require("axios");

    const input = args.join(" ");
    if (!input) {
      return api.sendMessage("Please provide a message to ask GPT.", event.threadID, event.messageID);
    }

    const apiKey = "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"; // এখানে তোমার OpenRouter API Key বসাও

    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo", // চাইলে gpt-4-vision বা gpt-4-o ব্যবহার করতে পারো
          messages: [
            {
              role: "user",
              content: input
            }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      const reply = res.data.choices?.[0]?.message?.content;
      if (reply) {
        return api.sendMessage(reply, event.threadID, event.messageID);
      } else {
        return api.sendMessage("GPT didn't respond properly.", event.threadID, event.messageID);
      }

    } catch (error) {
      console.error("GPT Error:", error.response?.data || error.message);
      return api.sendMessage("Error: Failed to connect to GPT.\n" + (error.response?.data?.error?.message || error.message), event.threadID, event.messageID);
    }
  }
};
