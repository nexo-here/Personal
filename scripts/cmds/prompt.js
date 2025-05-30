const axios = require("axios");

module.exports = {
  config: {
    name: "prompt",
    aliases: ["promptgenimg", "genprompt", "prompt"],
    version: "1.2",
    author: "nexo_here",
    countDown: 10,
    role: 0,
    shortDescription: "Generate prompt from an image by replying to it",
    longDescription: "Reply to any image with this command to get the AI-generated prompt description.",
    category: "ai",
    guide: {
      en: "Reply to an image with {pn} to get its prompt"
    }
  },

  langs: {
    en: {
      noReply: "⚠️ Please reply to an image with this command.",
      noImage: "❌ The replied message does not contain an image.",
      generating: "⏳ Generating prompt from the image, please wait...",
      error: "❌ Failed to generate prompt. Please try again later."
    }
  },

  onStart: async function({ message, event, api, getLang }) {
    try {
      if (!event.messageReply) return message.reply(getLang("noReply"));

      const attachments = event.messageReply.attachments || [];
      const imageAttachment = attachments.find(att => att.type === "photo" || att.type === "image");
      if (!imageAttachment) return message.reply(getLang("noImage"));

      const imageUrl = imageAttachment.url;

      await message.reply(getLang("generating"));

      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/prompt-gen?image=${encodeURIComponent(imageUrl)}`;

      const response = await axios.get(apiUrl);

      if (!response.data || response.data.code !== 0 || !response.data.data || !response.data.data.english) {
        return message.reply(getLang("error"));
      }

      const prompt = response.data.data.english;

      return message.reply(`📝 Generated Prompt:\n\n${prompt}`);

    } catch (error) {
      console.error("PromptGen API error:", error);
      return message.reply(getLang("error"));
    }
  }
};
