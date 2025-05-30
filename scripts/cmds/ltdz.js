module.exports = {
  config: {
    name: "ltdz",
    aliases: ["imglite", "d"],
    version: "1.0",
    author: "nexo_here",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate AI image (fast & free)" },
    longDescription: { en: "Use lightweight image API without API key" },
    category: "AI-IMAGE",
    guide: { en: "{pn} a fantasy dragon flying in the sky" }
  },

  onStart: async function ({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");

    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide a prompt.\nExample: /drawlite a robot playing guitar", event.threadID, event.messageID);

    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
    const imgPath = path.join(__dirname, "cache", `liteimg_${Date.now()}.jpg`);

    try {
      const response = await axios.get(imgUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `Here is your image for: "${prompt}"`,
          attachment: fs.createReadStream(imgPath)
        }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
      });

      writer.on("error", (err) => {
        console.error("Write error:", err);
        api.sendMessage("Failed to save image stream.", event.threadID, event.messageID);
      });

    } catch (err) {
      console.error("Image error:", err.message);
      return api.sendMessage("Error fetching image. Please try again later.", event.threadID, event.messageID);
    }
  }
};
          
