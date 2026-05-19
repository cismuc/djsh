import type { ClientEvents } from "discord.js";
import type BotClient from "@/BotClient";
import path from "path";
import { readdirSync } from "fs";
import { SlashCommandProps } from "@/types/commands";

type SlashCommandHandler = (...args: ClientEvents['interactionCreate']) => void;

export default class SlashCommandManager {
    private client: BotClient
    constructor(client: BotClient) {
        this.client = client;
        this.collectSlashCommands();
        client.on('interactionCreate', this.handleSlashCommandInteraction.bind(this))
    }

    private handleSlashCommandInteraction: SlashCommandHandler = async (interaction) => {
        if (interaction.isAutocomplete()) {
            console.log(interaction.commandName);
            const autocompleteCommand = this.client.commands.slashCommand.get(interaction.commandName);
            if (!autocompleteCommand || !autocompleteCommand.autocomplete) {
                await interaction.respond([{ name: "Autocomplete command not found", value: "Autocomplete command not found" }]);
                return;
            }
            autocompleteCommand.autocomplete(this.client, interaction);
        };
        if (!interaction.isChatInputCommand()) return;
        const command = this.client.commands.slashCommand.get(interaction.commandName);
        if (!command) return;

        command.execute(this.client, interaction)
    }

    private collectSlashCommands = async () => {
        const slashCommandFolderPath = path.join(process.cwd(), "src", "interaction", "slash");
        for(const cat of readdirSync(slashCommandFolderPath)) {
            for(const file of readdirSync(path.join(slashCommandFolderPath, cat))) {
                const filePath = path.join(slashCommandFolderPath, cat, file);
                const fileData = await (await import(filePath)).default as SlashCommandProps;
                if(fileData.data.name) {
                    this.client.commands.slashCommand.set(fileData.data.name, fileData);
                }
            }
        }
    }
};