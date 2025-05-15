module.exports = {
  config: {
    name: "usage",
    version: "1.0",
    author: "nexo_here",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show bot usage and performance info" },
    longDescription: { en: "View how many times bot commands were used, memory, uptime etc." },
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const os = require("os");
    const process = require("process");

    const uptime = process.uptime();
    const formatTime = (seconds) => {
      const d = Math.floor(seconds / (3600 * 24));
      const h = Math.floor((seconds % (3600 * 24)) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };

    const memory = process.memoryUsage();
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
    const usedMem = (memory.rss / 1024 / 1024).toFixed(2);

    const msg = 
`===== BOT USAGE INFO =====

• Uptime     : ${formatTime(uptime)}
• RAM Usage  : ${usedMem} MB / ${totalMem} MB
• Platform   : ${os.platform()} (${os.arch()})
• CPU        : ${os.cpus()[0].model}
• Hostname   : ${os.hostname()}

• Commands Used Since Start: [Feature coming soon]

========================`;

    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};
