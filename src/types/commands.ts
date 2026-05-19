import type { AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, Message, PermissionResolvable, SlashCommandBuilder } from "discord.js";
import type BotClient from "../BotClient";

type CategoryList = string


export interface PrefixCommand {
    name: string;
    description?: string;
    aliases?: string[];
    cooldown?: number;
    category?: CategoryList;
    nsfw?: boolean;
    devMode?: boolean;
    su?: boolean;
    permissions?: PermissionResolvable | PermissionResolvable[];
    run: (client: BotClient, message: Message, args: string[], prefix: string) => Promise<Message | undefined>;
};

export interface ContextMenuProps {
    data: ContextMenuCommandBuilder,
    execute: (client: BotClient, interaction: ContextMenuCommandInteraction) => Promise<void>;
}

export interface SlashCommandProps {
    data: SlashCommandBuilder,
    autocomplete?: (client: BotClient, interaction: AutocompleteInteraction) => Promise<void>;
    execute: (client: BotClient, interaction: ChatInputCommandInteraction) => Promise<void>;
}

export type InteractionCommandProps = 
| ContextMenuProps 
| SlashCommandProps;