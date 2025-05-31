const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "kiss",
    version: "1.1",
    author: "nexo & yazky",
    countDown: 5,
    role: 0,
    shortDescription: "Kiss a user",
    longDescription: "Send a kiss image between two users using their Facebook UID",
    category: "fun",
    guide: "{p}kiss @tag\n{p}kiss @tag1 @tag2"
  },

  onStart: async function ({ message, event, usersData }) {
    console.log("🔥 kiss command triggered");

    const mentions = Object.keys(event.mentions);
    const senderID = event.senderID;

    if (mentions.length === 0) return message.reply("❌ Tag at least one user.");

    const uid1 = mentions.length >= 2 ? mentions[0] : senderID;
    const uid2 = mentions.length >= 2 ? mentions[1] : mentions[0];

    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/kiss?userid1=${uid1}&userid2=${uid2}`;

    try {
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const contentType = res.headers["content-type"];
      const ext = contentType.includes("gif") ? "gif" : contentType.includes("png") ? "png" : "jpg";
      const filePath = path.join(__dirname, "cache", `kiss_image.${ext}`);

      fs.writeFileSync(filePath, res.data);

      const name1 = await usersData.getName(uid1);
      const name2 = await usersData.getName(uid2);

      await message.reply({
        body: `💋 ${name1} kissed ${name2}!`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath); // Clean up
    } catch (err) {
      console.error("❌ Error:", err.message || err);
      message.reply("❌ Failed to load image. Try again later.");
    }
  }
};

