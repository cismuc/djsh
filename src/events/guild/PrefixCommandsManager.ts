import { readdirSync } from "node:fs";
import path from "node:path";
import consola from "consola";
import { type ClientEvents, EmbedBuilder, type GuildMember, NewsChannel, type PermissionResolvable, TextChannel } from "discord.js";
import config from "@/config/base.json"
import type BotClient from "../../BotClient";
import type { PrefixCommand } from "../../types/commands";
import { prefix, su } from "../../config/base.json";
import PrefixSettings from "@/schema/PrefixSettings";

type MessageHandler = (...args: ClientEvents['messageCreate']) => void;

const filterHidden = (files: string[]) => files.filter((f) => !f.startsWith('.'));

const botMap = new Map<string, string>()
    .set("1", "1485337059433517077")
    .set("2", "1485337137309159644")
    .set("3", "1485337223581667418")
    // .set("4", "");

export default class PrefixCommandManager {
    private client: BotClient;
    constructor(client: BotClient) {
        this.client = client;
        this.registerCommands(client);
        client.on('messageCreate', this.handleMessageCommand.bind(this))
    }
 
    private handleMessageCommand: MessageHandler = async (message) => {
        if (message.author.bot || !message.guildId || !message.guild?.members.me?.permissions.has('SendMessages')) return;
        // 
        let guildConfiguration = await PrefixSettings.findOne({
            guildId: message.guildId
        });
        if (!guildConfiguration) guildConfiguration = await PrefixSettings.create({ guildId: message.guildId })
        const prefix = guildConfiguration.prefix;

        const rawInput = message.content.slice(prefix.length).trim();
        if (!rawInput) return;

        const args = rawInput.split(/ +/);

        const commandInput = args.shift()?.toLocaleLowerCase() as string;
        const command = this.client.commands.prefix.get(commandInput) || this.client.commands.prefix.get(this.client.commands.prefixAliases.get(commandInput) as string);
        if (!command) return;
        if (!message.guild?.members.me?.permissions.has('EmbedLinks')) {
            return message.channel.send({ content: '**Embed Links** permission is required to execute the commands!' });
        }
        if (command.nsfw) {
            if (((message.channel instanceof TextChannel || message.channel instanceof NewsChannel) && message.channel.nsfw)) {
                await message.channel.send({
                    embeds: [new EmbedBuilder().setDescription(`❌ This command only be executed in the NSFW channels.`)]
                })
                return;
            }
        }
        if (command.permissions) {
            const requiredPermissions = Array.isArray(command.permissions) ? command.permissions : [command.permissions];
            const userPermissionsResult = this.checkPermissions(message.member as GuildMember, requiredPermissions);
            if (!userPermissionsResult.hasPermission) {
                return message.channel.send({
                    embeds: [{
                        description: `❌ You don't have enough permission${userPermissionsResult.missingPermissions.length > 1 ? 's' : ''} to use this command.\n> **Pending Permission${userPermissionsResult.missingPermissions.length > 1 ? "s" : ''}:** ${userPermissionsResult.missingPermissions.map(permission => `\`${permission.toLocaleString().replace(/([A-Z])(?=[a-z])/g, ' $1').toLowerCase().replace('guild', 'server').replace(/\b\w/g, char => char.toUpperCase()).trim()}\``).join(', ')}`
                    }]
                });
            }
            const botPermissionResult = this.checkPermissions(message.guild?.members.me, requiredPermissions);
            if (!botPermissionResult.hasPermission) {
                return message.channel.send({
                    embeds: [{
                        description: `❌ I don't have enough permission${botPermissionResult.missingPermissions.length > 1 ? 's' : ''} to use this command.\n> **Pending Permission${botPermissionResult.missingPermissions.length > 1 ? "s" : ''}:** ${botPermissionResult.missingPermissions.map(permission => `\`${permission.toLocaleString().replace(/([A-Z])(?=[a-z])/g, ' $1').toLowerCase().replace('guild', 'server').replace(/\b\w/g, char => char.toUpperCase()).trim()}\``).join(', ')}`
                    }]
                });
            }
        }
        if (command.devMode && !config.su.includes(message.author.id)) {
            await message.channel.send({
                embeds: [new EmbedBuilder().setDescription('❌ This command is in progress.. You cannot execute it')]
            })
        }
        if (command.su && !config.su.includes(message.author.id)) {
            return message.channel.send({
                embeds: [{
                    description: '❌ You\'re not allowed to execute this command',
                    color: 0xFF0000
                }]
            });
        }
        await command.run(this.client, message, args, prefix);
    }

    private async registerCommands(client: BotClient) {
        const commandDir = path.join(process.cwd(), 'src', 'commands');
        for (const cat of filterHidden(readdirSync(commandDir))) {
            for (const file of filterHidden(readdirSync(path.join(commandDir, cat))).filter(f => f.endsWith('.js') || f.endsWith('.ts'))) {
                const commandFile = path.join(commandDir, cat, file);
                const commandModule = (await import(commandFile)).default as PrefixCommand;
                if (commandModule) {
                    if (!commandModule.name) {
                        consola.warn(`Command name not found in`, `${cat}/${file}. Skipping.`);
                        continue;
                    }
                    if (!commandModule.run) {
                        consola.warn(`Execution function not found in`, `${cat}/${file}`);
                        continue;
                    }
                    client.commands.prefix.set(commandModule.name, commandModule);
                    if (commandModule.aliases) {
                        for (const aliase of commandModule.aliases) {
                            client.commands.prefixAliases.set(aliase, commandModule.name);
                        }
                    }
                }
            }
        }
        consola.success("Added prefix commands!")
    }

    private checkPermissions(member: GuildMember, permissions: PermissionResolvable[]): { hasPermission: boolean, missingPermissions: PermissionResolvable[] } {
        const missingPermissions: PermissionResolvable[] = [];
        for (const permission of permissions) {
            if (!member.permissions.has(permission)) {
                missingPermissions.push(permission);
            }
        }

        return {
            hasPermission: missingPermissions.length === 0,
            missingPermissions: missingPermissions
        };
    }
}
