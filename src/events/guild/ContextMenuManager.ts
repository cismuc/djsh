import type { ClientEvents } from "discord.js";
import type BotClient from "@/BotClient";
import { readdirSync } from "fs";
import path from "path";
import { ContextMenuProps } from "@/types/commands";

type ContextMenuHandler = (...args: ClientEvents["interactionCreate"]) => void;

export default class ContextMenuManager {
  client: BotClient;
  constructor(client: BotClient) {
    this.client = client;
    this.collectContextMenuCommands();
    client.on("interactionCreate", this.handleContextMenuInteraction.bind(this));
  }

  private handleContextMenuInteraction: ContextMenuHandler = async (interaction) => {
    if (!interaction.isContextMenuCommand()) return;

    const command = this.client.commands.contextMenu.get(
      interaction.commandName,
    );
    if (!command) {
      interaction.reply({
        content: "Cannot find the context",
        flags: "Ephemeral"
      });
      return;
    }
    command.execute(this.client, interaction);
  };

  private collectContextMenuCommands = async () => {
        const slashCommandFolderPath = path.join(process.cwd(), "src", "interaction", "context-menus");
        for(const cat of readdirSync(slashCommandFolderPath)) {
            for(const file of readdirSync(path.join(slashCommandFolderPath, cat))) {
                const filePath = path.join(slashCommandFolderPath, cat, file);
                const fileData = await (await import(filePath)).default as ContextMenuProps;
                if(fileData.data.name) {
                    this.client.commands.contextMenu.set(fileData.data.name, fileData);
                }
            }
        }
    }
}
