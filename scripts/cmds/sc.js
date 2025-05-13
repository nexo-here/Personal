const axios = require('axios');
const fs = require('fs');
const path = require('path');
const scdl = require('soundcloud-downloader').default;

scdl.setClientID('AXHkknI02RnaQ0vVJ3FK3pVcoToTlmFK');

module.exports = {
  config: {
    name: "soundcloud",
    aliases: ["sc", "music", "sing"],
    version: "1.0",
    author: "JARiF@Cock",
    countDown: 5,
    role: 0,
    longDescription: {
      en: "Search and play SoundCloud music using a song name.",
    },
    category: "music",
    guide: {
      en: "Usage: {pn} song name\nExample: {pn} see you again",
    },
  },

  onStart: async function ({ api, args, message, event }) {
    const query = args.join(" ");
    if (!query) {
      return message.reply("⚠️ Please provide a song name.\nExample: /sing see you again");
    }

    try {
      api.setMessageReaction("🔍", event.messageID, () => {}, true);
      const waitMsg = await message.reply("🎵 Searching for tracks...");

      const searchUrl = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&client_id=AXHkknI02RnaQ0vVJ3FK3pVcoToTlmFK&limit=5`;
      const res = await axios.get(searchUrl);
      const tracks = res.data.collection;

      if (!tracks || tracks.length === 0) return message.reply("❌ No results found.");

      let msg = "🎶 Choose a track by replying with the number:\n\n";
      tracks.forEach((track, index) => {
        msg += `${index + 1}. ${track.title} - ${track.user.username}\n`;
      });

      const sent = await message.reply(msg);

      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        messageID: sent.messageID,
        author: event.senderID,
        tracks
      });

    } catch (error) {
      console.error("Search error:", error);
      message.reply("❌ Error occurred while searching.");
    }
  },

  onReply: async function ({ Reply, event, message, api }) {
    const choice = parseInt(event.body);
    const track = Reply.tracks[choice - 1];

    if (isNaN(choice) || !track) {
      return message.reply("⚠️ Invalid number. Please reply with a valid option (1–5).");
    }

    try {
      api.setMessageReaction("🎧", event.messageID, () => {}, true);
      const stream = await scdl.download(track.permalink_url);

      const filePath = path.join(__dirname, "temp", `${track.id}.mp3`);
      const writer = fs.createWriteStream(filePath);
      stream.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: `🎧 *${track.title}*\n👤 By: ${track.user.username}\n🔗 ${track.permalink_url}`,
          attachment: fs.createReadStream(filePath)
        });
        fs.unlinkSync(filePath);
      });

      writer.on("error", err => {
        console.error("Write stream error:", err);
        message.reply("❌ Failed to write the audio file.");
      });

    } catch (err) {
      console.error("Download error:", err);
      message.reply("❌ Failed to download or play the track.");
    }
  }
};
        
