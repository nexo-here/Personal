const axios = require("axios");

module.exports = {
  config: {
    name: "chat",
    aliases: ["bot"],
    version: "5.1",
    author: "nexo_here",
    countDown: 2,
    role: 0,
    shortDescription: "SimSimi chat & train with reply support",
    longDescription: "Talk or train SimSimi AI. Supports reply-based chat after initial message.",
    category: "ai",
    guide: "{pn} <message>\n{pn} train <question> => <answer>\nThen reply to bot's messages to continue chatting."
  },

  onStart: async function ({ message, event, args }) {
    const apiKey = "dd3b7f9f9c223046af0c373514b76592";
    const input = args.join(" ");
    const language = "bn";

    if (!input) {
      return message.reply("Please provide a message or use: train <question> => <answer>");
    }

    // Handle training
    if (input.toLowerCase().startsWith("train ")) {
      const raw = input.slice(6).split("=>");
      if (raw.length < 2) {
        return message.reply("Use format: train <question> => <answer>");
      }

      const question = raw[0].trim();
      const answer = raw[1].trim();

      const payload = {
        api: apiKey,
        question,
        answer,
        language,
        sentiment: "neutral",
        category: "general",
        response_type: "text",
        image_url: null,
        type: "good"
      };

      try {
        const res = await axios.post("https://sim.api.nexalo.xyz/v1/train", payload);
        const { status_code, data } = res.data;

        if (status_code === 201) {
          return message.reply(
            `✅ Trained successfully!\n🧠 Q: ${question}\n💬 A: ${answer}\n🆔 ID: ${data.id} | 📊 API Calls: ${data.api_calls}`
          );
        } else {
          return message.reply(`❌ Training failed: ${res.data.message || "Unknown error"}`);
        }
      } catch (err) {
        console.error(err);
        return message.reply("❌ Error during training.");
      }
    }

    // Normal chat
    try {
      const res = await axios.post("https://sim.api.nexalo.xyz/v1/chat", {
        api: apiKey,
        question: input,
        language
      });

      const data = res.data;

      if (data.status_code === 200) {
        return message.reply(data.data.answer);
      } else {
        return message.reply("No response found. Try training me.");
      }
    } catch (err) {
      console.error(err);
      return message.reply("❌ Error while chatting.");
    }
  },

  onChat: async function ({ message, event }) {
    const apiKey = "dd3b7f9f9c223046af0c373514b76592";
    const language = "bn";

    // Only respond if user is replying to a bot message
    if (!event.messageReply || event.messageReply.senderID !== global.GoatBot.botID) return;
    const userInput = event.body;

    if (!userInput) return;

    try {
      const res = await axios.post("https://sim.api.nexalo.xyz/v1/chat", {
        api: apiKey,
        question: userInput,
        language
      });

      const data = res.data;

      if (data.status_code === 200) {
        return message.reply(data.data.answer);
      } else {
        return message.reply("🤖 No answer found for your reply.");
      }
    } catch (err) {
      console.error(err);
      return message.reply("❌ Error replying to your message.");
    }
  }
};
    
