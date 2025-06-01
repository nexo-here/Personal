const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "fbdl",
    version: "3.1",
    author: "nexo",
    role: 0,
    shortDescription: "Download Facebook video",
    category: "media",
    guide: "{p}fbdl <facebook_link> or just send the link in chat",
    usePrefix: false // allows onChat to trigger without command
  },

  onStart: async function ({ message, event, args }) {
    let url = args[0];

    if (!url && event.messageReply?.body) {
      const match = event.messageReply.body.match(/https?:\/\/[^\s]+/);
      if (match) url = match[0];
    }

    if (!url || !url.includes("facebook.com")) {
      return message.reply("❌ Please provide or reply to a valid Facebook link.");
    }

    return downloadFacebookVideo(url, message);
  },

  onChat: async function ({ message, event }) {
    const body = event.body || "";
    const replyBody = event.messageReply?.body || "";
    const fullText = `${body} ${replyBody}`;
    const match = fullText.match(/https?:\/\/[^\s]+facebook\.com[^\s]*/i);

    if (!match) return;

    const url = match[0];
    return downloadFacebookVideo(url, message);
  }
};

async function downloadFacebookVideo(url, message) {
  const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/fbdl?url=${encodeURIComponent(url)}`;
  const videoPath = path.join(__dirname, "cache", `fb_video_${Date.now()}.mp4`);

  try {
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(videoPath, response.data);

    await message.reply({
      body: "✅ Facebook video downloaded successfully.",
      attachment: fs.createReadStream(videoPath)
    });

    fs.unlinkSync(videoPath);
  } catch (err) {
    console.error("❌ Video download error:", err.message);
    return message.reply("❌ Unable to download video. It may be private, removed, or invalid.");
  }
}
