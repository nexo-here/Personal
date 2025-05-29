const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.3",
    author: "NTKhang & Modified by Nexo",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show all commands & usage" },
    longDescription: { en: "View full list of commands or get info about a specific command" },
    category: "info",
    guide: { en: "{p}{n} or {p}{n} commandName" },
    priority: 1
  },

  onStart: async function ({ message, args, event, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    const helpImages = [
      'https://i.ibb.co/WNdxv777/image.gif',
      'https://i.ibb.co/Lddm1GvG/image.gif',
      'https://i.ibb.co/My0gMCQY/image.gif'
    ];

    let attachment = null;
    try {
      const url = helpImages[Math.floor(Math.random() * helpImages.length)];
      attachment = await global.utils.getStreamFromURL(url);
    } catch (e) {
      console.log("Image fetch failed:", e.message);
    }

    // No arguments: show command list
    if (!args[0]) {
      const categories = {};
      for (const [name, cmd] of commands) {
        if (cmd.config.role > 1 && role < cmd.config.role) continue;
        const cat = cmd.config.category || "Uncategorized";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      }

      let msg = "╭─────────────⭓\n│   📜 𝗔𝗟𝗟 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦\n╰─────────────⭓\n";

      for (const cat in categories) {
        msg += `\n• ${cat.toUpperCase()}:\n`;
        const cmds = categories[cat].sort();
        for (let i = 0; i < cmds.length; i += 3) {
          const chunk = cmds.slice(i, i + 3).map(cmd => `» ${cmd}`).join("   ");
          msg += `   ${chunk}\n`;
        }
      }

      msg += `\nℹ️ Use: ${prefix}help [command]\n📌 Example: ${prefix}help bank\n\nOener: Neoaz ギ`;

      return message.reply({ body: msg, attachment });
    }

    // Specific command help
    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.get(aliases.get(name));
    if (!command) return message.reply(`❌ Command "${name}" not found.`);

    const cfg = command.config;
    const usage = cfg.guide?.en?.replace(/{p}/g, prefix).replace(/{n}/g, cfg.name) || "No usage guide.";
    const roleName = roleTextToString(cfg.role);

    const res = `
╭───『 ℹ️ ${cfg.name.toUpperCase()} COMMAND 』───╮
│ 📝 Description: ${cfg.longDescription?.en || "No description"}
│ 🧩 Aliases: ${cfg.aliases?.join(", ") || "None"}
│ 🔒 Role: ${roleName}
│ 🧑‍💻 Author: ${cfg.author || "Unknown"}
│ ⏱️ Cooldown: ${cfg.countDown || 1}s
│ 🧾 Version: ${cfg.version || "1.0"}
│ 📚 Usage: ${usage}
╰────────────────────────────────╯`.trim();

    return message.reply({ body: res });
  }
};

function roleTextToString(role) {
  switch (role) {
    case 0: return "All users";
    case 1: return "Group admins";
    case 2: return "Bot admins";
    default: return "Unknown";
  }
}
