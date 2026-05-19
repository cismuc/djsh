import { readdirSync } from "node:fs";
import path from "node:path";
import consola from "consola";
import { Client, Collection, type ContextMenuCommandBuilder, Partials, type SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";
import Redis from "ioredis";
import InitializeMongoDB from "./handlers/initializeMongoDB";
import type {
  ContextMenuProps,
  PrefixCommand,
  SlashCommandProps,
} from "./types/commands";

config({ path: '.env' });

export default class BotClient extends Client {
  commands = {
    prefix: new Collection<string, PrefixCommand>(),
    prefixAliases: new Collection<string, string>(),
    contextMenu: new Collection<string, ContextMenuProps>(),
    slashCommand: new Collection<string, SlashCommandProps>(),
  };
  applicationCommandsArray: (SlashCommandBuilder | ContextMenuCommandBuilder)[] = [];
  redis = new Redis(process.env.REDIS_URL);
  constructor() {
    super({
      intents: [
        "AutoModerationConfiguration",
        "AutoModerationExecution",
        "DirectMessagePolls",
        "DirectMessageReactions",
        "DirectMessageTyping",
        "DirectMessages",
        "GuildBans",
        "GuildEmojisAndStickers",
        "GuildIntegrations",
        "GuildInvites",
        "GuildMembers",
        "GuildMessagePolls",
        "GuildMessageReactions",
        "GuildMessageTyping",
        "GuildMessages",
        "GuildModeration",
        "GuildPresences",
        "GuildScheduledEvents",
        "GuildVoiceStates",
        "Guilds",
        "MessageContent",
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Reaction,
        Partials.ThreadMember,
      ],
      presence: {
        status: "online",
      },
    });
  }

  public async init(): Promise<void> {
    consola.info("Setting up the Bot")
    await this.redisEvent();
    await this.initializeEvents();
    await this.initializeModules();
    await InitializeMongoDB();
    await this.login(process.env.DISCORD_TOKEN);
  }

  private async initializeEvents() {
    consola.start("Initializing Gateway events");
    const eventsDir = path.join(process.cwd(), "events");
    for (const cat of readdirSync(path.join(eventsDir))) {
      for (const event of readdirSync(path.join(eventsDir, cat))) {
        const filepath = path.join(eventsDir, cat, event);
        const EventClass = await (await import(filepath)).default;
        new EventClass(this);
      }
    }
    consola.success("Initialized Gateway events");
  }

  private async initializeModules() {
    consola.start("Initializing Gateway modules [feature based]");
    const eventsDir = path.join(process.cwd(), "modules");
    for (const cat of readdirSync(path.join(eventsDir))) {
      for (const event of readdirSync(path.join(eventsDir, cat))) {
        const filepath = path.join(eventsDir, cat, event);
        const EventClass = await (await import(filepath)).default;
        new EventClass(this);
      }
    }
    consola.success("Initialized Gateway modules [feature based]");
  }

  private async redisEvent() {
    this.redis.on("connecting", () => {
      consola.info("Connecting to redis");
    });

    this.redis.on("connect", () => {
      consola.success("Successfully connected to redis");
    });
  }
}
