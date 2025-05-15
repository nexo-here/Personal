const axios = require("axios");

module.exports = {
  config: {
    name: "prompt",
    aliases: ["imgprompt"],
    version: "1.0",
    author: "nexo_here",
    countDown: 5,
    role: 0,
    shortDescription: "Reply for AI-generated prompt",
    category: "image",
    guide: "{pn} (reply to an image)"
  },

  onStart: async function ({ event, message }) {
    try {
      const reply = event.messageReply;
      if (!reply || !reply.attachments || reply.attachments.length === 0 || reply.attachments[0].type !== "photo") {
        return message.reply("⚠️ please reply to an image ");
      }

      const imageUrl = reply.attachments[0].url;
      await message.reply("⏳ creating...");

      const apiKey = "acc_cd0133a7e47a081";  // আপনার Imagga API key
      const apiSecret = "b003a51b7d5ac5f51fd87b2a75c349e0"; // আপনার Imagga API secret

      // Imagga API call
      const response = await axios.get(
        `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(imageUrl)}`,
        {
          auth: {
            username: apiKey,
            password: apiSecret
          }
        }
      );

      if (!response.data.result || !response.data.result.tags) {
        return message.reply("⚠️ No prompt found for this picture ");
      }

      const tags = response.data.result.tags
        .slice(0, 10)
        .map(tag => tag.tag.en)
        .join(", ");

      return message.reply(`🖼️ ছবির প্রম্পট: ${tags}`);

    } catch (err) {
      console.error(err.response?.data || err.message || err);
      return message.reply("❌ an error occurred ");
    }
  }
};
        
