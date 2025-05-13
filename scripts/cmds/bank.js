const fs = require("fs-extra");
const path = require("path");

const dataPath = path.join(__dirname, "data.json");
if (!fs.existsSync(dataPath)) fs.writeJsonSync(dataPath, {});

module.exports = {
  config: {
    name: "bank",
    aliases: [],
    version: "1.2",
    author: "Nexo + ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Advanced banking system",
    longDescription: "A full-featured bank with earning games and leaderboard.",
    category: "economy",
    guide: `
{pn} balance - আপনার মোট টাকা দেখুন।
{pn} deposit <amount> - টাকা ব্যাংকে জমা দিন।
{pn} withdraw <amount> - ব্যাংক থেকে টাকা তুলুন।
{pn} leaderboard - সেরা টাকার মালিকদের তালিকা দেখুন।
{pn} daily - প্রতিদিন ফ্রি টাকা নিন।
{pn} work - কাজ করে টাকা আয় করুন।
{pn} quiz - প্রশ্নের উত্তর দিয়ে টাকা আয় করুন।
{pn} dice - ডাইস গেম খেলে টাকা জিতুন বা হারান।
{pn} guess <1-5> - সংখ্যাটি অনুমান করুন।
{pn} coin <head/tail> <amount> - কয়েন টস গেম খেলুন।
{pn} roulette <amount> <red/black/green> - রুলেট গেম খেলুন।`
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { senderID } = event;
    let data = fs.readJsonSync(dataPath);
    if (!data[senderID]) data[senderID] = { money: 0, bank: 0, lastDaily: 0 };
    const user = data[senderID];

    const save = () => fs.writeJsonSync(dataPath, data);
    const send = (msg) => message.reply(msg);
    const command = args[0];

    switch (command) {
      case "balance":
        return send(`Wallet: $${user.money}\nBank: $${user.bank}`);

      case "deposit": {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0 || amount > user.money)
          return send("সঠিক পরিমাণ লিখুন এবং আপনার কাছে যথেষ্ট টাকা থাকতে হবে।");
        user.money -= amount;
        user.bank += amount;
        save();
        return send(`জমা হয়েছে $${amount}।`);
      }

      case "withdraw": {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0 || amount > user.bank)
          return send("সঠিক পরিমাণ লিখুন এবং ব্যাংকে যথেষ্ট টাকা থাকতে হবে।");
        user.bank -= amount;
        user.money += amount;
        save();
        return send(`তোলা হয়েছে $${amount}।`);
      }

      case "leaderboard": {
        const sorted = Object.entries(data).sort((a, b) => (b[1].money + b[1].bank) - (a[1].money + a[1].bank)).slice(0, 10);
        const top = await Promise.all(sorted.map(async ([uid, val], i) => {
          const name = await usersData.getName(uid);
          return `${i + 1}. ${name}: $${val.money + val.bank}`;
        }));
        return send(`🏆 Leaderboard:\n${top.join("\n")}`);
      }

      case "daily": {
        const now = Date.now();
        if (now - user.lastDaily < 86400000)
          return send("আপনি আজকের ফ্রি টাকা ইতিমধ্যে নিয়েছেন। কাল আবার চেষ্টা করুন।");
        const reward = Math.floor(Math.random() * 500 + 100);
        user.money += reward;
        user.lastDaily = now;
        save();
        return send(`আপনি আজকের ফ্রি টাকা পেয়েছেন: $${reward}`);
      }

      case "work": {
        const jobs = ["developer", "farmer", "teacher", "youtuber"];
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const reward = Math.floor(Math.random() * 400 + 100);
        user.money += reward;
        save();
        return send(`আপনি ${job} হিসাবে কাজ করে $${reward} আয় করেছেন।`);
      }

      case "quiz": {
        const questions = [
          { q: "2 + 2 = ?", a: "4" },
          { q: "বাংলাদেশের রাজধানী কি?", a: "ঢাকা" }
        ];
        const selected = questions[Math.floor(Math.random() * questions.length)];
        message.reply(selected.q);
        const reply = await message.waitForReply(10000);
        if (!reply) return send("সময় শেষ, উত্তর দেননি।");
        if (reply.body.toLowerCase() === selected.a.toLowerCase()) {
          const reward = 200;
          user.money += reward;
          save();
          return send(`সঠিক উত্তর! আপনি $${reward} পেয়েছেন।`);
        } else return send("ভুল উত্তর।");
      }

      case "dice": {
        const roll = Math.ceil(Math.random() * 6);
        const reward = roll >= 4 ? 100 : -50;
        user.money += reward;
        save();
        return send(`আপনি ${roll} পেলেন এবং $${reward} ${(reward > 0 ? "পেয়েছেন" : "হারিয়েছেন")}`);
      }

      case "guess": {
        const num = Math.ceil(Math.random() * 5);
        const guess = parseInt(args[1]);
        if (!guess || guess < 1 || guess > 5) return send("১ থেকে ৫ এর মধ্যে একটি সংখ্যা দিন।");
        if (guess === num) {
          const reward = 300;
          user.money += reward;
          save();
          return send(`সঠিক! সংখ্যা ছিল ${num}, আপনি $${reward} পেয়েছেন।`);
        } else return send(`ভুল! সঠিক সংখ্যা ছিল ${num}`);
      }

      case "coin": {
        const choice = args[1];
        const bet = parseInt(args[2]);
        if (!choice || !["head", "tail"].includes(choice)) return send("head বা tail দিন।");
        if (isNaN(bet) || bet <= 0 || bet > user.money) return send("সঠিক বাজি দিন এবং পর্যাপ্ত টাকা থাকতে হবে।");
        const flip = Math.random() < 0.5 ? "head" : "tail";
        if (flip === choice) {
          user.money += bet;
          save();
          return send(`আপনি ${flip} পেলেন! $${bet} জিতেছেন।`);
        } else {
          user.money -= bet;
          save();
          return send(`আপনি ${flip} পেলেন! $${bet} হারিয়েছেন।`);
        }
      }

      case "roulette": {
        const bet = parseInt(args[1]);
        const color = args[2];
        if (!color || !["red", "black", "green"].includes(color)) return send("red, black বা green দিন।");
        if (isNaN(bet) || bet <= 0 || bet > user.money) return send("সঠিক বাজি দিন এবং পর্যাপ্ত টাকা থাকতে হবে।");
        const spin = Math.floor(Math.random() * 15);
        let result = spin === 0 ? "green" : spin % 2 === 0 ? "black" : "red";
        if (color === result) {
          const reward = color === "green" ? bet * 14 : bet;
          user.money += reward;
          save();
          return send(`রুলেট ${result} হয়েছে! আপনি $${reward} জিতেছেন।`);
        } else {
          user.money -= bet;
          save();
          return send(`রুলেট ${result} হয়েছে! আপনি $${bet} হারিয়েছেন।`);
        }
      }

      default:
        return send("উপলব্ধ সাবকমান্ড: balance, deposit, withdraw, leaderboard, daily, work, quiz, dice, guess, coin, roulette");
    }
  }
};
