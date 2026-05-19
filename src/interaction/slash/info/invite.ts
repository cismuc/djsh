import { SlashCommandProps } from "@/types/commands";
import { OAuth2Scopes, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName('invite').setDescription('Get the invite link of the bot!'),
    execute: async (client, interaction) => {
        const inviteLink = client.generateInvite({
            permissions: ["Administrator"],
            scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
        });
        await interaction.reply({ content: `${inviteLink}`, ephemeral: true });
    }
        
} as SlashCommandProps