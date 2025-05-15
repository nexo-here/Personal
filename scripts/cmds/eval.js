module.exports = {
  config: {
    name: "eval",
    version: "1.0",
    author: "nexo_here",
    countDown: 5,
    role: 2, // শুধু bot owner বা admin চালাতে পারবে
    shortDescription: { en: "Evaluate JavaScript code" },
    longDescription: { en: "Run JavaScript code dynamically and return output" },
    category: "developer",
    guide: { en: "{pn} <code>" }
  },

  onStart: async function({ api, event, args }) {
    if (!args.length) return api.sendMessage("Please provide JavaScript code to evaluate.", event.threadID, event.messageID);

    const code = args.join(" ");

    // Simple blacklist keywords to avoid dangerous eval
    const blacklist = ["process", "require", "fs", "child_process", "eval", "Function", "constructor"];
    if (blacklist.some(word => code.includes(word))) {
      return api.sendMessage("This code contains forbidden keywords.", event.threadID, event.messageID);
    }

    try {
      let evaled = eval(code);

      if (typeof evaled !== "string") {
        evaled = require("util").inspect(evaled, { depth: 1 });
      }

      if (evaled.length > 1900) evaled = evaled.slice(0, 1900) + "...";

      api.sendMessage("Result:\n" + evaled, event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage("Error:\n" + error.message, event.threadID, event.messageID);
    }
  }
};
