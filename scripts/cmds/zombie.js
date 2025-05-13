const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "zombiee",
    aliases: ["zombie"],
    version: "1.1",
    author: "Nexo + ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Convert any image to zombie version",
    longDescription: "Send or reply to an image, and this command will turn it into zombie-style using AI",
    category: "image",
    guide: "{pn} [reply to image or mention user or nothing]\n\n- Reply to an image to zombify it\n- Mention someone to use their avatar\n- Just type {pn} to use your own avatar"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;
    let imageURL;

    // 1. Priority: Reply to image
    if (type === "message_reply" && messageReply.attachments.length > 0) {
      const attachment = messageReply.attachments[0];
      if (attachment.type === "photo") {
        imageURL = attachment.url;
      }
    }

    // 2. If user mentioned
    else if (Object.keys(mentions).length > 0) {
      const mentionID = Object.keys(mentions)[0];
      imageURL = `https://graph.facebook.com/${mentionID}/picture?width=1024&height=1024`;
    }

    // 3. Default: Own avatar
    else {
      imageURL = `https://graph.facebook.com/${senderID}/picture?width=1024&height=1024`;
    }

    if (!imageURL) return api.sendMessage("Please reply to an image or mention someone.", threadID, messageID);

    try {
      api.sendMessage("Creating zombie version of the image...", threadID, messageID);

      // Call AI API
      const apiURL = `https://nekobot.xyz/api/imagegen?type=zombie&url=${encodeURIComponent(imageURL)}`;
      const response = await axios.get(apiURL);

      if (!response.data || !response.data.message) {
        return api.sendMessage("Zombie API failed to generate image.", threadID, messageID);
      }

      const zombieImg = response.data.message;
      const imgPath = path.join(__dirname, "cache", `zombie-${Date.now()}.jpg`);
      const imgData = await axios.get(zombieImg, { responseType: "arraybuffer" });

      fs.writeFileSync(imgPath, imgData.data);

      api.sendMessage({
        body: "Here is your zombie image!",
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => fs.unlinkSync(imgPath), messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("Something went wrong while processing the image.", threadID, messageID);
    }
  }
};