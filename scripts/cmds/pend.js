const fs = require("fs");
const path = require("path");

const approvedFile = path.join(__dirname, "approved.json");

module.exports = {
  config: {
    name: "pendingapprove",
    aliases: ["pending"],
    version: "1.0",
    author: "NEXXO",
    role: 2,
    shortDescription: { en: "View and approve pending groups" },
    category: "owner",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    try {
      const threads = await api.getThreadList(100, null, ["PENDING"]);
      const groups = threads.filter(t => t.isGroup);

      if (groups.length === 0) return api.sendMessage("❌ No pending groups found.", event.threadID);

      let msg = "📥 Pending Group Threads:\n\n";
      const idMap = [];

      groups.forEach((thread, index) => {
        msg += `${index + 1}. ${thread.name || "Unnamed"} | TID: ${thread.threadID}\n`;
        idMap.push(thread.threadID);
      });

      msg += "\nReply with the number to approve that group.";

      const message = await api.sendMessage(msg, event.threadID);

      // Set up reply listener
      global.GoatBot.onReply.set(message.messageID, {
        commandName: this.config.name,
        messageID: message.messageID,
        idMap,
        type: "pending-approve",
        author: event.senderID
      });
    } catch (err) {
      return api.sendMessage("❌ Failed to fetch pending threads.\n" + err.message, event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { type, author, idMap } = Reply;
    if (event.senderID !== author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > idMap.length)
      return api.sendMessage("⚠️ Invalid selection.", event.threadID);

    const threadID = idMap[choice - 1];

    try {
      const info = await api.getThreadInfo(threadID);

      // Load or create approval list
      let approved = {};
      if (fs.existsSync(approvedFile)) {
        approved = JSON.parse(fs.readFileSync(approvedFile, "utf8"));
      }

      approved[threadID] = {
        name: info.threadName || "Unnamed",
        time: Date.now()
      };

      fs.writeFileSync(approvedFile, JSON.stringify(approved, null, 2));

      api.sendMessage(`✅ Approved group "${info.threadName}" (${threadID})`, event.threadID);
    } catch (err) {
      api.sendMessage("❌ Failed to approve group: " + err.message, event.threadID);
    }
  }
};
