const axios = require("axios");

module.exports = {
  config: {
    name: "porn",
    aliases: ["ks", "kator"],
    version: "1.0",
    author: "nexo_here",
    countDown: 20,
    role: 2,
    shortDescription: "Search and download videos from KatorSex API",
    longDescription: "Search NSFW videos by keyword and download them",
    category: "18+",
    guide: {
      en: "{pn} <search keyword>"
    }
  },

  langs: {
    en: {
      noQuery: "⚠️ Please provide a search keyword.",
      loading: "⏳ Searching videos...",
      noResults: "❌ No videos found for your search.",
      choose: "📽️ Reply with the number of the video to download (1-{count}):",
      invalidChoice: "❌ Invalid choice. Reply with a number between 1 and {count}.",
      downloading: "⬇️ Preparing your video...",
      error: "❌ Failed to fetch or download the video.",
    }
  },

  onStart: async function({ api, args, message, event, getLang }) {
    const keyword = args.join(" ");
    if (!keyword) return message.reply(getLang("noQuery"));

    try {
      await message.reply(getLang("loading"));

      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/katorsex?page=${encodeURIComponent(keyword)}`;
      const res = await axios.get(apiUrl);
      const results = res.data.results;

      if (!results || results.length === 0) return message.reply(getLang("noResults"));

      // Build UI list with thumbnails and titles
      let listMsg = "🎥 *Search Results*\n──────────────────────────\n";
      results.forEach((item, idx) => {
        listMsg += `\n${idx + 1}. ${item.title}\nThumbnail: ${item.thumbnail}\n`;
      });
      listMsg += `\n${getLang("choose").replace("{count}", results.length)}`;

      const sent = await message.reply(listMsg);

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        messageID: sent.messageID,
        author: event.senderID,
        results
      });

    } catch (err) {
      console.error("API fetch error:", err);
      return message.reply(getLang("error"));
    }
  },

  onReply: async function({ Reply, event, message, getLang }) {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length) {
      return message.reply(getLang("invalidChoice").replace("{count}", Reply.results.length));
    }

    const video = Reply.results[choice - 1];

    try {
      await message.reply(getLang("downloading"));

      // Send video as attachment with caption and download link
      return message.reply({
        body: `🎬 *${video.title}*\n\n🔗 Download: ${video.downloadUrl}`,
        attachment: await global.utils.getStreamFromURL(video.videoUrl)
      });
    } catch (err) {
      console.error("Video sending error:", err);
      return message.reply(getLang("error"));
    }
  }
};
                                   
