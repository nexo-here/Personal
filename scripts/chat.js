const axios = require("axios");

module.exports = {
  config: {
    name: "chat",
    aliases: ["bot"],
    version: "5.0",
    author: "nexo_here",
    countDown: 2,
    role: 0,
    shortDescription: "SimSimi chat and reply system",
    longDescription: "Talk with SimSimi using commands or natural replies",
    category: "ai",
    guide: "{pn} <message> to start, then reply to continue"
  },

  onStart: async function ({ message, event, args }) {
    const apiKey = "dd3b7f9f9c223046af0c373514b76592";
    const input = args.join(" ");
    const language = "bn";

    if (!input) return message.reply("Please provide a message to chat.");

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
        return message.reply("No answer found. Try training me first.");
      }
    } catch (err) {
      console.error(err);
      return message.reply("Error chatting with SimSimi.");
    }
  },

  onChat: async function ({ message, event, getLang, args, reply, usersData }) {
    const apiKey = "dd3b7f9f9c223046af0c373514b76592";
    const language = "bn";

    // Only proceed if the user is replying to the bot
    if (!event.messageReply || event.messageReply.senderID !== global.GoatBot.botID) return;

    const userMessage = event.body;
    if (!userMessage) return;

    try {
      const res = await axios.post("https://sim.api.nexalo.xyz/v1/chat", {
        api: apiKey,
        question: userMessage,
        language
      });

      const data = res.data;

      if (data.status_code === 200) {
        return message.reply(data.data.answer);
      } else {
        return message.reply("No response found for this message.");
      }
    } catch (err) {
      console.error(err);
      return message.reply("Failed to get response.");
    }
  }
};
