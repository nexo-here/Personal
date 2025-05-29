const { removeHomeDir, log } = global.utils;

module.exports = {
	config: {
		name: "eval",
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Test code nhanh",
			en: "Test code quickly"
		},
		longDescription: {
			vi: "Test code nhanh",
			en: "Test code quickly"
		},
		category: "owner",
		guide: {
			vi: "{pn} <đoạn code cần test>",
			en: "{pn} <code to test>"
		}
	},

	langs: {
		vi: {
			error: "❌ Đã có lỗi xảy ra:"
		},
		en: {
			error: "❌ An error occurred:"
		}
	},

	onStart: async function ({ api, args, message, getLang }) {
		function output(msg) {
			try {
				if (typeof msg === "function" || typeof msg === "boolean" || typeof msg === "number")
					msg = msg.toString();
				else if (msg instanceof Map) {
					let text = `Map(${msg.size}) `;
					text += JSON.stringify(mapToObj(msg), null, 2);
					msg = text;
				}
				else if (typeof msg === "object")
					msg = JSON.stringify(msg, null, 2);
				else if (typeof msg === "undefined")
					msg = "undefined";

				message.reply(msg);
			} catch (err) {
				message.reply(`${getLang("error")}\n${removeHomeDir(err.stack || err.message)}`);
			}
		}

		function out(msg) {
			output(msg);
		}

		function mapToObj(map) {
			const obj = {};
			for (const [key, value] of map.entries()) {
				obj[key] = value;
			}
			return obj;
		}

		const code = args.join(" ");
		try {
			const result = await eval(`(async () => { ${code} })()`);
			if (result !== undefined) output(result);
		} catch (err) {
			log.err("eval command", err);
			message.reply(`${getLang("error")}\n${removeHomeDir(err.stack || JSON.stringify(err, null, 2))}`);
		}
	}
};
