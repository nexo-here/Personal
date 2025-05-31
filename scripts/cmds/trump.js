const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "trump",
    version: "1.0",
    author: "nexo",
    countDown: 5,
    role: 0,
    shortDescription: "Generate Trump meme with user and text",
    longDescription: "Generates a Trump-style image/video for a user with custom text",
    category: "fun",
    guide: "{p}trump @user <text>"
  },

  onStart: async function ({ message, event, args, usersData }) {
    const mentions = Object.keys(event.mentions);
    if (mentions.length === 0) return message.reply("❌ Please tag a user.");

    if (args.length < 2) return message.reply("❌ Please provide text after the mention.");

    const userid = mentions[0];

    // Remove mention from args to get the text
    const text = args.slice(1).join(" ");

    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/trump?userid=${userid}&text=${encodeURIComponent(text)}`;

    try {
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const contentType = res.headers["content-type"];
      const ext = contentType.includes("gif") ? "gif" : contentType.includes("mp4") ? "mp4" : "jpg";
      const filePath = path.join(__dirname, "cache", `trump_${userid}.${ext}`);

      fs.writeFileSync(filePath, res.data);

      const name = await usersData.getName(userid);

      await message.reply({
        body: `🇺🇸 Trump meme for ${name}:\n"${text}"`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("❌ Trump command error:", err);
      message.reply("⚠️ Failed to generate Trump meme.");
    }
  }
};
