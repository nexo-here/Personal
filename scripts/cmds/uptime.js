const os = require("os");
const { createCanvas } = require("canvas");
const fs = require("fs");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    version: "8.0",
    author: "nexo_here",
    countDown: 5,
    role: 0,
    shortDescription: "Premium system uptime image & text",
    longDescription: "Show system info as a premium styled image with text report",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const width = 1400;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background gradient - soft dark with subtle blue-green accent
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#0a111a");
    bgGradient.addColorStop(1, "#12232e");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Main card container with rounded corners and soft glow shadow
    const cardX = 80;
    const cardY = 80;
    const cardWidth = width - cardX * 2;
    const cardHeight = height - cardY * 2;
    const radius = 30;

    ctx.shadowColor = "rgba(0, 255, 170, 0.25)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = "rgba(8, 25, 40, 0.9)";
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, radius, true, false);

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Title Ichigo AI with gradient fill
    const titleGradient = ctx.createLinearGradient(cardX + 40, cardY + 40, cardX + 600, cardY + 90);
    titleGradient.addColorStop(0, "#00ffaa");
    titleGradient.addColorStop(1, "#007f66");
    ctx.fillStyle = titleGradient;
    ctx.font = "bold 56px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("Ichigo AI", cardX + 40, cardY + 40);

    // Subheading line below title
    ctx.strokeStyle = "rgba(0, 255, 170, 0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cardX + 40, cardY + 110);
    ctx.lineTo(cardX + cardWidth - 40, cardY + 110);
    ctx.stroke();

    // System info
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const botUptime = `${d}d ${h}h ${m}m ${s}s`;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramUsagePercent = (usedMem / totalMem) * 100;

    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCount = cpus.length;
    const loadAvg = os.loadavg()[0];

    const nodeVer = process.version;
    const platform = os.platform();
    const arch = os.arch();

    // Use custom hostname as Render Premium (your request)
    const hostname = "Render";

    // Info data with emojis
    const info = [
      { icon: "⏳", label: "Uptime", value: botUptime },
      { icon: "🖥️", label: "CPU", value: `${cpuModel} (${cpuCount} cores)` },
      { icon: "⚡", label: "Load Average (1 min)", value: loadAvg.toFixed(2) },
      { icon: "💾", label: "RAM Usage", value: `${(usedMem / 1024 / 1024).toFixed(1)} MB / ${(totalMem / 1024 / 1024).toFixed(1)} MB (${ramUsagePercent.toFixed(2)}%)` },
      { icon: "🛠️", label: "Platform", value: `${platform} (${arch})` },
      { icon: "📦", label: "Node.js Version", value: nodeVer },
      { icon: "🏷️", label: "Hostname", value: hostname }
    ];

    ctx.textBaseline = "middle";

    // Layout variables
    let infoStartY = cardY + 160;
    const lineHeight = 60;
    const iconSize = 36;
    const labelX = cardX + 90;
    const valueX = cardX + 580;

    // Draw info lines
    for (let i = 0; i < info.length; i++) {
      const { icon, label, value } = info[i];
      const y = infoStartY + i * lineHeight;

      // Icon
      ctx.font = `bold ${iconSize}px Segoe UI Emoji, Arial, sans-serif`;
      ctx.fillStyle = "#00ffaa";
      ctx.fillText(icon, cardX + 45, y);

      // Label text
      ctx.font = "700 30px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      ctx.fillStyle = "#00ffbb";
      ctx.fillText(label, labelX, y);

      // Value text
      ctx.font = "500 28px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      ctx.fillStyle = "#b0f9d6";
      ctx.fillText(value, valueX, y);
    }

    // RAM usage bar with premium glow
    const barX = cardX + 90;
    const barY = infoStartY + 6 * lineHeight + 40;
    const barWidth = cardWidth - (barX - cardX) - 120;
    const barHeight = 40;

    // Background bar
    ctx.fillStyle = "rgba(0, 170, 110, 0.15)";
    roundRect(ctx, barX, barY, barWidth, barHeight, 20, true, false);

    // Gradient fill with shadow glow
    const ramGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    ramGradient.addColorStop(0, "#00ffaa");
    ramGradient.addColorStop(1, "#008866");
    ctx.fillStyle = ramGradient;

    ctx.shadowColor = "#00ffaa99";
    ctx.shadowBlur = 25;
    roundRect(ctx, barX, barY, (ramUsagePercent / 100) * barWidth, barHeight, 20, true, false);

    ctx.shadowBlur = 0;

    // RAM usage text on bar
    ctx.fillStyle = "rgba(0, 30, 10, 0.85)";
    ctx.font = "bold 24px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(`RAM Usage: ${ramUsagePercent.toFixed(2)}%`, barX + 30, barY + barHeight / 2);

    // CPU load bar with glow
    const loadBarY = barY + 80;

    ctx.fillStyle = "rgba(170, 85, 0, 0.15)";
    roundRect(ctx, barX, loadBarY, barWidth, barHeight, 20, true, false);

    const loadPercent = Math.min((loadAvg / cpuCount) * 100, 100);
    const loadGradient = ctx.createLinearGradient(barX, loadBarY, barX + barWidth, loadBarY);
    loadGradient.addColorStop(0, "#ffaa00");
    loadGradient.addColorStop(1, "#cc8800");
    ctx.fillStyle = loadGradient;

    ctx.shadowColor = "#ffaa0099";
    ctx.shadowBlur = 25;
    roundRect(ctx, barX, loadBarY, (loadPercent / 100) * barWidth, barHeight, 20, true, false);

    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(51, 26, 0, 0.9)";
    ctx.font = "bold 24px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.fillText(`CPU Load: ${loadAvg.toFixed(2)} (normalized ${loadPercent.toFixed(2)}%)`, barX + 30, loadBarY + barHeight / 2);

    // Hostname badge pill top-right inside card
    const badgeText = `HOST: ${hostname}`;
    ctx.font = "700 30px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    const badgeWidth = ctx.measureText(badgeText).width + 60;
    const badgeHeight = 50;
    const badgeX = cardX + cardWidth - badgeWidth - 40;
    const badgeY = cardY + 45;

    ctx.fillStyle = "rgba(0, 255, 170, 0.12)";
    roundRect(ctx, badgeX, badgeY - 35, badgeWidth, badgeHeight, 25, true, false);

    ctx.fillStyle = "#00ffaa";
    ctx.fillText(badgeText, badgeX + 30, badgeY - 12);

    // Helper: rounded rectangle drawing
    function roundRect(ctx, x, y, w, h, r, fill, stroke) {
      if (typeof r === "undefined") r = 5;
      if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
      else {
        const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
        for (let side in defaultRadius) r[side] = r[side] || defaultRadius[side];
      }
      ctx.beginPath();
      ctx.moveTo(x + r.tl, y);
      ctx.lineTo(x + w - r.tr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
      ctx.lineTo(x + w, y + h - r.br);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
      ctx.lineTo(x + r.bl, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
      ctx.lineTo(x, y + r.tl);
      ctx.quadraticCurveTo(x, y, x + r.tl, y);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    // Save image
    const buffer = canvas.toBuffer("image/png");
    const fileName = "uptime_report_ichigo_premium.png";
    fs.writeFileSync(fileName, buffer);

    // Prepare plain text report for message
    const plainTextReport = [
      "Ichigo AI System Uptime Report",
      "------------------------------",
      ...info.map(i => `${i.icon} ${i.label}: ${i.value}`),
      `💾 RAM Usage Bar: ${ramUsagePercent.toFixed(2)}%`,
      `⚡ CPU Load Bar: ${loadAvg.toFixed(2)} (normalized ${loadPercent.toFixed(2)}%)`
    ].join("\n");

    // Reply with image and text
    message.reply({
      body: plainTextReport,
      attachment: fs.createReadStream(fileName)
    });
  }
};
      
