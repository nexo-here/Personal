const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "fuck",
    version: "1.1",
    author: "nexo",
    countDown: 5,
    role: 0,
    shortDescription: "Fun interaction between command sender and mentioned user",
    longDescription: "Uses sender as 'one' and mentioned user as 'two' in the API",
    category: "fun",
    guide: "{p}fuck @user"
  },

  onStart: async function({ message, event, usersData }) {
    const mentions = Object.keys(event.mentions);
    if (mentions.length !== 1) {
      return message.reply("❌ Please mention exactly one user.");
    }

    const one = event.senderID;    // command sender
    const two = mentions[0];       // mentioned user

    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/fuck?one=${one}&two=${two}`;

    try {
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const contentType = res.headers["content-type"];
      const ext = contentType.includes("gif") ? "gif" : contentType.includes("mp4") ? "mp4" : "jpg";
      const filePath = path.join(__dirname, "cache", `fuck_${one}_${two}.${ext}`);

      fs.writeFileSync(filePath, res.data);

      const name1 = await usersData.getName(one);
      const name2 = await usersData.getName(two);

      await message.reply({
        body: `🔥 ${name1} x ${name2} interaction!`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("❌ Fuck command error:", err);
      message.reply("⚠️ Failed to fetch from the API.");
    }
  }
};
