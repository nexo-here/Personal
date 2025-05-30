const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "flx",
    aliases: ["realimg", "hdimage", "imggen"],
    version: "3.0",
    author: "nexo_here",
    countDown: 5,
    role: 0,
    shortDescription: "Generate hyper-realistic AI image",
    longDescription: "Generate ultra HD and realistic AI-generated image from text using enhanced fluxv2",
    category: "ai",
    guide: {
      en: "{pn} <prompt>\n\nExample: {pn} a photorealistic lion in the savannah, golden hour lighting"
    }
  },

  langs: {
    en: {
      noPrompt: "⚠️ Please provide a prompt to generate a realistic image.",
      generating: "🧠 Generating ultra-realistic image, please wait...",
      failed: "❌ Failed to generate image. Please try again later.",
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const rawPrompt = args.join(" ");
    if (!rawPrompt) return message.reply(getLang("noPrompt"));

    const formattedPrompt = `${rawPrompt}, ultra-detailed, photorealistic, 8K, realistic lighting, cinematic, masterpiece`;

    message.reply(getLang("generating"));

    try {
      const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/fluxv2?prompt=${encodeURIComponent(formattedPrompt)}`);
      const data = res.data;

      if (!data?.imageUrl) {
        return message.reply(getLang("failed"));
      }

      const imgResponse = await axios.get(data.imageUrl, { responseType: "stream" });
      const fileName = `fluxv2_${Date.now()}.webp`;
      const filePath = `${__dirname}/cache/${fileName}`;
      const writer = fs.createWriteStream(filePath);

      imgResponse.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({
          body: `✅ Prompt:\n"${formattedPrompt}"\n\n📸 Here's your AI-generated image`,
          attachment: fs.createReadStream(filePath)
        }, () => fs.unlinkSync(filePath));
      });

      writer.on("error", () => message.reply(getLang("failed")));
    } catch (err) {
      console.error(err.message);
      return message.reply(getLang("failed"));
    }
  }
};
        
