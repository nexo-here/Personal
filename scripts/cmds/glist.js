module.exports = {
  config: {
    name: "groups",
    aliases: ["mygroups", "glist"],
    version: "1.0",
    author: "NEXXO",
    countDown: 10,
    role: 2, // Only bot admin
    shortDescription: "List groups the bot is in",
    longDescription: "Shows a list of all groups where the bot is added.",
    category: "admin",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, message }) {
    try {
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = threads.filter(thread => thread.isGroup);

      if (groupThreads.length === 0) {
        return message.reply("বটটি কোনো গ্রুপে নেই।");
      }

      let msg = `🤖 বটটি ${groupThreads.length}টি গ্রুপে আছে:\n`;
      let index = 1;
      for (const thread of groupThreads) {
        msg += `\n${index++}. ${thread.name || "Unnamed Group"}\nID: ${thread.threadID}\nMembers: ${thread.participantIDs.length}\n`;
      }

      message.reply(msg);
    } catch (err) {
      console.error(err);
      message.reply("⚠️ | গ্রুপের তালিকা আনতে সমস্যা হয়েছে।");
    }
  
  }
};