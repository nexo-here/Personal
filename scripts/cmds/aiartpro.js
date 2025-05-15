module.exports = {
  config: {
    name: "aiartpro",
    aliases: ["art", "ap"],
    version: "1.0",
    author: "ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate AI images using advanced Pollinations API" },
    longDescription: { en: "Create images using prompt with optional style using Pollinations API" },
    category: "ai",
    guide: { en: "{pn} [style] | [your prompt]\nExample:\n{pn} anime | a girl in futuristic city" }
  },

  onStart: async function ({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");

    const input = args.join(" ").split("|");
    const style = input[0]?.trim() || "realistic";
    const prompt = input[1]?.trim();

    if (!prompt) {
      return api.sendMessage("Please use the format:\n/aiartpro [style] | [prompt]\n\nExample:\n/aiartpro anime | a robot cat flying in space", event.threadID, event.messageID);
    }

    const finalPrompt = `${style} style ${prompt}`;
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}`;
    const imgPath = path.join(__dirname, "cache", `aiartpro_${Date.now()}.png`);

    try {
      const response = await axios.get(imgUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `🎨 AI Image Generated\nStyle: ${style}\nPrompt: ${prompt}`,
          attachment: fs.createReadStream(imgPath)
        }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
      });

      writer.on("error", () => {
        api.sendMessage("Failed to download the image.", event.threadID, event.messageID);
      });
    } catch (err) {
      console.error(err.message);
      api.sendMessage("Image generation failed. Try a simpler prompt or different style.", event.threadID, event.messageID);
    }
  }
};
