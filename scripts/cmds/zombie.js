const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "zombie",
    version: "1.0",
    author: "nexo",
    countDown: 5,
    role: 0,
    shortDescription: "Turn a user into a zombie",
    longDescription: "Generates a zombie style image/video of a tagged user",
    category: "fun",
    guide: "{p}zombie @tag"
  },

  onStart: async function ({ message, event, usersData }) {
    const mentions = Object.keys(event.mentions);
    if (mentions.length === 0) return message.reply("❌ Please tag a user.");

    const userid = mentions[0];
    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/zombie?userid=${userid}`;

    try {
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const contentType = res.headers["content-type"];
      const ext = contentType.includes("gif") ? "gif" : contentType.includes("mp4") ? "mp4" : "jpg";
      const filePath = path.join(__dirname, "cache", `zombie_${userid}.${ext}`);

      fs.writeFileSync(filePath, res.data);

      const name = await usersData.getName(userid);

      await message.reply({
        body: `🧟‍♂️ ${name} is now a zombie!`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("❌ Zombie command error:", err);
      message.reply("⚠️ Failed to generate zombie image/video.");
    }
  }
};
