module.exports = {
  config: {
    name: "uptime",
    aliases: ["runtime", "alive","up"],
    version: "2.0",
    author: "Nexo",
    countDown: 5,
    role: 0,
    shortDescription: "Show bot uptime and status",
    longDescription: "Displays how long the bot has been running, last reboot, and system info.",
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, args, usersData, threadsData, commandName }) {
    const os = require("os");
    const moment = require("moment-timezone");

    // Convert uptime to days, hours, minutes, seconds
    const totalSec = process.uptime();
    const days = Math.floor(totalSec / (60 * 60 * 24));
    const hours = Math.floor((totalSec % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSec % (60 * 60)) / 60);
    const seconds = Math.floor(totalSec % 60);

    // Last reboot time
    const now = moment.tz("Asia/Dhaka");
    const rebootTime = now.clone().subtract(totalSec, "seconds").format("YYYY-MM-DD HH:mm:ss");

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const usedMemory = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);

    // Response message
    const msg = `=== [ BOT STATUS ] ===\n` +
      `⏱ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
      `🕒 Last Reboot: ${rebootTime}\n` +
      `💾 RAM Usage: ${usedMemory}MB / ${totalMemory}MB\n` +
      `🖥 Platform: ${os.platform()} | Arch: ${os.arch()}`;

    api.sendMessage(msg, event.threadID, event.messageID);
  }
};