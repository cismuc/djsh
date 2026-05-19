import { EmbedBuilder, type TextChannel } from "discord.js";
import os from "os";
import type { PrefixCommand } from "../../types/commands";

function formatUptime(ms: number) {
  let sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  sec %= 3600;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

export default {
  name: "botinfo",
  description: "Get information about the bot.",
  aliases: ["bot-info"],
  category: "info",
  run: async (client, message, _args, _prefix) => {
    // Memory usage
    const memory = process.memoryUsage();

    // Process CPU usage (seconds)
    const cpuUsage = process.cpuUsage();
    const cpuSecs = ((cpuUsage.user + cpuUsage.system) / 1e6).toFixed(2);

    // Ping
    const ping = Date.now() - message.createdTimestamp;

    const embed = new EmbedBuilder()
      .setTitle("Bot Statitics")
      .setDescription("```fix\nCreator: smashanam [aka cismuc]\n```")
      .setFields(
        {
          name: "Process",
          value:
            "```fix\n" +
            `Total: ${(memory.rss / 1024 / 1024).toFixed(2)} MB\n` +
            `Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB\n` +
            `Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
            "```",
          inline: true,
        },
        {
          name: "Ping",
          value:
            "```fix\n" +
            `Ping: ${ping}ms\n` +
            `Websocket: ${client.ws.ping}ms\n` +
            `Uptime: ${formatUptime(process.uptime() * 1000)}\n` +
            "```",
          inline: true,
        },
        {
          name: "Host",
          value:
            "```fix\n" +
            `Platform: ${os.platform()} ${os.arch()}\n` +
            `Model: ${os.cpus()[0].model}\n` +
            `CPU Usage: ${cpuSecs} Secs\n` +
            "```",
          inline: false,
        },
      );
    return (message.channel as TextChannel).send({
      embeds: [embed],
    });
  },
} as PrefixCommand;
