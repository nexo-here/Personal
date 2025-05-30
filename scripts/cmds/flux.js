const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "flux",
    aliases: ["imggen", "gen", "flx"],
    version: "4.0",
    author: "nexo_here",
    countDown: 5,
    role: 0,
    shortDescription: "Generate ultra-realistic AI images",
    longDescription: "Use Flux API to generate premium, hyper-realistic AI images with style options",
    category: "ai",
    guide: {
      en: "{pn} <prompt> | [style]\n\n📌 Example:\n{pn} a lion in desert | realistic\n{pn} warrior girl with sword | anime"
    }
  },

  langs: {
    en: {
      noPrompt: `❗ Please provide a prompt.\n\n📌 Example:\n• flux a lion in jungle | realistic\n• flux dragon on rooftop | fantasy`,
      generating: "🖼️ Generating your premium AI image...",
      failed: "❌ Failed to generate image. Please try again later.",
    }
  },

  onStart: async function ({ message, args, getLang }) {
    if (!args[0]) return message.reply(getLang("noPrompt"));

    const input = args.join(" ").split("|");
    const rawPrompt = input[0].trim();
    const style = (input[1] || "realistic").trim().toLowerCase();

    const styleMap = {
      realistic: "photorealistic, hyper-realism, 8K UHD, DSLR, depth of field, soft shadows",
      anime: "anime style, vibrant, clean lines, cel shading, highly detailed",
      fantasy: "fantasy art, epic background, magical aura, dramatic lighting",
      cyberpunk: "cyberpunk, neon lights, night city, futuristic, ultra detail",
      cartoon: "cartoon style, bold outlines, fun colors, 2D animation look"
    };

    const styleTag = styleMap[style] || styleMap["realistic"];
    const enhancedPrompt = `${rawPrompt}, ${styleTag}`;

    message.reply(getLang("generating"));

    try {
      const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/flux?prompt=${encodeURIComponent(enhancedPrompt)}`);
      const imageUrl = res?.data?.data?.imageUrl;

      if (!imageUrl) return message.reply(getLang("failed"));

      const imgStream = await axios.get(imageUrl, { responseType: "stream" });
      const filePath = `${__dirname}/cache/flux_${Date.now()}.jpg`;
      const writer = fs.createWriteStream(filePath);

      imgStream.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({
          body: `🧠 Prompt: ${enhancedPrompt}\n🎨 Style: ${style}`,
          attachment: fs.createReadStream(filePath)
        }, () => fs.unlinkSync(filePath));
      });

      writer.on("error", () => {
        message.reply(getLang("failed"));
      });

    } catch (err) {
      console.error(err.message);
      return message.reply(getLang("failed"));
    }
  }
};
