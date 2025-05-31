const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "nigga",
    version: "1.0",
    author: "nexo",
    countDown: 5,
    role: 0,
    shortDescription: "Generate image/video from API",
    longDescription: "Fetches media from the nigga API for tagged user",
    category: "fun",
    guide: "{p}nigga @user"
  },

  onStart: async function ({ message, event, usersData }) {
    const mentions = Object.keys(event.mentions);
    if (mentions.length === 0) return message.reply("❌ Please tag a user.");

    const userid = mentions[0];
    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/nigga?userid=${userid}`;

    try {
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const contentType = res.headers["content-type"];
      const ext = contentType.includes("gif") ? "gif" : contentType.includes("mp4") ? "mp4" : "jpg";
      const filePath = path.join(__dirname, "cache", `nigga_${userid}.${ext}`);

      fs.writeFileSync(filePath, res.data);

      const name = await usersData.getName(userid);

      await message.reply({
        body: `Here's something for ${name}:`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("❌ Nigga command error:", err);
      message.reply("⚠️ Failed to fetch from the API.");
    }
  }
};
