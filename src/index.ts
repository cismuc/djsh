import consola from "consola";
import BotClient from "./BotClient";

const bot = new BotClient();

process.on("SIGINT", async () => {
    await bot.destroy();
    consola.info("Closing all connections");
    process.exit();
});

bot.init();
