const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
 config: {
	name: "help",
	version: "2.1",
	author: "NTKhang & Modified by Nexo",
	countDown: 5,
	role: 0,
	shortDescription: { en: "Show all commands & usage" },
	longDescription: { en: "View full list of commands or get info about a specific command" },
	category: "info",
	guide: { en: "{p}{n} or {p}{n} commandName" },
	priority: 1,
 },

 onStart: async function ({ message, args, event, threadsData, role }) {
	const { threadID } = event;
	const prefix = getPrefix(threadID);

	const helpImages = [
	 'https://i.imgur.com/xyDcrW3.jpeg',
	 'https://i.imgur.com/URCFjrS.jpeg',
	 'https://i.imgur.com/iAHVc1a.jpeg'
	];
	const helpImage = helpImages[Math.floor(Math.random() * helpImages.length)];
	let attachment = null;
	try {
	 attachment = await global.utils.getStreamFromURL(helpImage);
	} catch (e) {
	 console.log("Image fetch failed:", e.message);
	}

	if (!args[0]) {
	 // Show full command list by category
	 const categories = {};
	 for (const [name, value] of commands) {
		if (value.config.role > 1 && role < value.config.role) continue;
		const cat = value.config.category || "Uncategorized";
		if (!categories[cat]) categories[cat] = [];
		categories[cat].push(name);
	 }

	 let msg = `┏━━━━━━━━━━━━━━━━━━━┓\n┃ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧 ┃\n┗━━━━━━━━━━━━━━━━━━━┛\n`;

	 for (const category in categories) {
		msg += `\n【 ${category.toUpperCase()} 】\n`;
		const list = categories[category].sort();
		for (let i = 0; i < list.length; i += 3) {
		 const chunk = list.slice(i, i + 3).map(cmd => `・${cmd}`).join('   ');
		 msg += `${chunk}\n`;
		}
	 }

	 msg += `\nUse "${prefix}help [command]" to get details about any command.\n`;
	 msg += `Example: ${prefix}help bank`;

	 return message.reply({ body: msg, attachment });
	}

	// Help for specific command
	const name = args[0].toLowerCase();
	const command = commands.get(name) || commands.get(aliases.get(name));
	if (!command) {
	 return message.reply(`✘ Command "${name}" not found.`);
	}

	const config = command.config;
	const usage = config.guide?.en?.replace(/{p}/g, prefix).replace(/{n}/g, config.name) || "No usage guide.";
	const roleName = roleTextToString(config.role);

	let response = `┏━━━『 ${config.name.toUpperCase()} 』━━━┓\n`;
	response += `┣ Description: ${config.longDescription?.en || "No description"}\n`;
	response += `┣ Aliases: ${config.aliases?.join(", ") || "None"}\n`;
	response += `┣ Role: ${roleName}\n`;
	response += `┣ Version: ${config.version || "1.0"}\n`;
	response += `┣ Author: ${config.author || "Unknown"}\n`;
	response += `┣ Cooldown: ${config.countDown || 1}s\n`;
	response += `┣ Usage: ${usage}\n`;
	response += `┗━━━━━━━━━━━━━━━━━━━━┛`;

	return message.reply({ body: response });
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
