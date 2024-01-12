import {
  type CommandInteraction,
  type ClientEvents,
  type MessageCreateOptions,
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
  ChannelType,
  WebhookClient,
} from "discord.js";
import { fileURLToPath } from "node:url";
import { dynamicImport } from "../misc/util/index.ts";
import type InteractionCommand from "./command.ts";
import { logger } from "../index.ts";
import { I18n } from "i18n";
import type DiscordEvent from "./event.ts";
import {
  INTERACTION_RATE_LIMIT_ATTEMPTS,
  INTERACTION_RATE_LIMIT_TIME,
  KAKELE_ITEM_ICONS_URL,
  COLORS,
} from "../misc/constants/index.ts";
import type { KakeleMonster, KakeleItem, UserRateLimit } from "./misc.ts";
import path from "path";
import fs from "fs";
import "dotenv/config";
import { createMongoConnection } from "../database/index.ts";
import kakeleEmojis from "../kakele-data/emojis.ts";
import kakeleItems from "../kakele-data/items.ts";
import kakeleMonsters from "../kakele-data/monsters.js";
import "../misc/canvas/index.ts";

export default class Biridim extends Client {
  public commands: Collection<string, InteractionCommand>;
  public interactionRateLimit: Collection<string, UserRateLimit>;
  public kakeleEmojis: Array<{ id: string; name: string }>;
  public kakeleItems: KakeleItem[];
  public kakeleMonsters: KakeleMonster[];
  public icons: typeof KAKELE_ITEM_ICONS_URL;
  public colors: typeof COLORS;
  public interactionCooldown: Collection<string, number>;
  public marketReport: WebhookClient;
  public i18n: I18n;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.commands = new Collection<string, InteractionCommand>();
    this.interactionRateLimit = new Collection<string, UserRateLimit>();
    this.colors = COLORS;
    this.icons = KAKELE_ITEM_ICONS_URL;
    this.kakeleEmojis = kakeleEmojis.map((x) => x.emojis).flat();
    this.kakeleItems = kakeleItems;
    this.kakeleMonsters = kakeleMonsters;
    this.interactionCooldown = new Collection<string, number>();

    this.marketReport = new WebhookClient({
      url: process.env.DISCORD_WEBHOOK_MARKET_REPORT as string,
    });

    this.i18n = new I18n({
      defaultLocale: "EN",
      locales: ["EN", "ES", "PL", "PT"],
      directory: path.join("./src", "i18n"),
      autoReload: true,
    });
  }

  /**
   * Loads event modules and attaches them to the client.
   */
  private async loadEvents(): Promise<void> {
    const eventFolderPath = fileURLToPath(
      new URL("../events", import.meta.url),
    );
    const eventFolder = fs.readdirSync(eventFolderPath);

    for (const folder of eventFolder) {
      const eventPath = path.join(eventFolderPath, folder);
      const eventFiles = fs
        .readdirSync(eventPath)
        .filter((file) => file.endsWith(".ts"));
      for (const file of eventFiles) {
        const filePath = path.join(eventPath, file);

        const event = (await dynamicImport(filePath)) as DiscordEvent<
          keyof ClientEvents
        >;
        if ("name" in event && "run" in event) {
          if (event.once) {
            this.once(event.name, (...args) => event.run(this, ...args));
          } else {
            this.on(event.name, (...args) => event.run(this, ...args));
          }
        } else {
          logger.error(
            "loadEvents",
            `The event ${filePath} does not have the properties 'name' and 'run'.`,
          );
        }
      }
    }
  }

  /**
   * Loads and registers interaction command modules.
   * @param deploy - Whether to deploy the commands to Discord.
   */
  private async loadInteractionCommands(deploy: boolean): Promise<void> {
    let rest;

    if (deploy) {
      rest = new REST({ version: "10" }).setToken(
        process.env.DISCORD_CLIENT_TOKEN as string,
      );
    }

    const commandsFolderPath = fileURLToPath(
      new URL("../commands", import.meta.url),
    );
    const globalCommands: Array<InteractionCommand["data"]> = [];

    const commandFolders = fs.readdirSync(commandsFolderPath);

    for (const folderName of commandFolders) {
      const commandFolderPath = path.join(commandsFolderPath, folderName);
      const commandFiles = fs
        .readdirSync(commandFolderPath)
        .filter((fileName) => fileName.endsWith(".ts"));

      for (const fileName of commandFiles) {
        const filePath = path.join(commandFolderPath, fileName);

        const command = (await dynamicImport(filePath)) as InteractionCommand;

        if ("data" in command && "run" in command) {
          this.commands.set(command.data.name, command);

          if (deploy) {
            // fix later
            if (command.options.guilds.length > 0) {
              for (const guild of command.options.guilds) {
                await rest
                  .put(
                    Routes.applicationGuildCommands(
                      process.env.DISCORD_CLIENT_ID as string,
                      guild,
                    ),
                    { body: [command.data] },
                  )
                  .catch(() => {});
              }
            } else {
              globalCommands.push(command.data);
            }
          }
        } else {
          logger.error(
            "loadInteractionCommands",
            `The command ${filePath} does not have the properties 'data' and 'run'.`,
          );
        }
      }
    }

    if (globalCommands.length > 0) {
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID as string),
        { body: globalCommands },
      );
    }
  }

  /**
   * Reloads a specific interaction command.
   * @param command - The name of the command to reload.
   * @param deploy - Whether to deploy the command to Discord.
   */
  public async reloadInteractionCommand(
    command: string,
    deploy: boolean,
  ): Promise<void> {
    let rest;

    if (deploy) {
      rest = new REST({ version: "10" }).setToken(
        process.env.DISCORD_CLIENT_TOKEN as string,
      );
    }
    const commandsFolderPath = fileURLToPath(
      new URL("../commands", import.meta.url),
    );

    const reloadCommandModule = async (modulePath: string): Promise<void> => {
      const cacheBustingModulePath = `${modulePath}?update=${Date.now()}`;
      const command = (await import(cacheBustingModulePath)).default;

      this.commands.set(command.data.name, command);

      if (deploy) {
        if (command.options.guilds.length > 0) {
          for (const guild of command.options.guilds) {
            await rest.put(
              Routes.applicationGuildCommands(
                process.env.DISCORD_CLIENT_ID as string,
                guild,
              ),
              { body: command.data },
            );
          }
        }
      }
    };

    const readFolder = async (folderPath): Promise<void> => {
      const items = fs.readdirSync(folderPath);

      for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const itemStats = fs.statSync(itemPath);

        if (itemStats.isDirectory()) {
          await readFolder(itemPath);
        } else if (itemStats.isFile() && item.endsWith(".ts")) {
          const commandFileName = path.basename(item, ".ts");
          if (commandFileName === command) {
            await reloadCommandModule(itemPath);
          }
        }
      }
    };

    await readFolder(commandsFolderPath);
  }

  /**
   * Handles interaction rate limits for users.
   * @param interaction - The command interaction triggering the rate limit check.
   * @returns Whether the user is within the rate limit.
   */
  public async handleInteractionRateLimit(
    interaction: CommandInteraction,
  ): Promise<boolean> {
    const user: UserRateLimit | undefined = this.interactionRateLimit.get(
      interaction.user.id,
    );

    if (user === undefined) {
      const newUser: UserRateLimit = {
        user: interaction.user.id,
        attempts: 1,
      };
      this.interactionRateLimit.set(interaction.user.id, newUser);
      setTimeout(() => {
        this.interactionRateLimit.delete(interaction.user.id);
      }, INTERACTION_RATE_LIMIT_TIME);
      return true;
    }

    if (user.attempts >= INTERACTION_RATE_LIMIT_ATTEMPTS) {
      await interaction.reply({
        content: "You have exceeded the rate limit.",
        ephemeral: true,
      });
      return false;
    }

    if (user.attempts >= INTERACTION_RATE_LIMIT_TIME - 1) {
      logger.error(
        "handleInteractionRateLimit",
        `The user ${interaction.user.id} has reached the rate limit.`,
      );
    }

    this.interactionRateLimit.set(interaction.user.id, {
      ...user,
      attempts: user.attempts + 1,
    });
    return true;
  }

  /**
   * Sends a message to a guild channel.
   * @param id - The ID of the channel.
   * @param message - The message content or options.
   */
  public async sendMessageToGuildChannel(
    id: string,
    message: string | MessageCreateOptions,
  ): Promise<void> {
    try {
      const channel = await this.channels.fetch(id);

      if (
        channel !== null &&
        (channel.type === ChannelType.GuildText ||
          channel.type === ChannelType.DM)
      ) {
        await channel.send(message);
      }
    } catch (err) {
      logger.error("sendMessageToGuildChannel", err);
    }
  }

  /**
   * Sends a message to a user.
   * @param id - The ID of the user.
   * @param message - The message content or options.
   */

  public async sendMessageToUser(
    id: string,
    message: string | MessageCreateOptions,
  ): Promise<void> {
    try {
      const user = await this.users.fetch(id);
      await user.send(message);
    } catch (err) {
      logger.error("sendMessageToUser", err);
    }
  }

  /**
   * Handles interaction cooldowns.
   * @param identifier - A string identifier for the cooldown.
   * @param time - The cooldown duration in milliseconds.
   * @returns The remaining time for the cooldown, or undefined if not in cooldown.
   */
  public handleInteractionCooldown(
    identifier: string,
    time: number,
  ): number | undefined {
    if (this.interactionCooldown.has(identifier)) {
      const timeLeft = this.interactionCooldown.get(identifier);

      if (timeLeft !== undefined) {
        return timeLeft;
      }
    } else {
      const cooldownEndTime = Date.now() + time;
      this.interactionCooldown.set(identifier, cooldownEndTime);

      setTimeout(() => {
        this.interactionCooldown.delete(identifier);
      }, time);

      return undefined;
    }
  }

  /**
   * Retrieves the emoji for a Kakele item.
   * @param item - The name of the item.
   * @returns The corresponding emoji for the item.
   */
  public getKakeleItemEmoji(item: string): string {
    const itemNameWithoutSpecialChars = item.replace(/[^A-Z0-9]/gi, "");

    const emoji = this.kakeleEmojis.find(
      (x) => x.name === itemNameWithoutSpecialChars,
    );

    return emoji !== undefined
      ? `<:${emoji.name}:${emoji.id}>`
      : "<:marketStats:1128425449853308969>";
  }

  /**
   * Starts the Biridim bot by loading commands, events, and establishing a connection.
   */

  public translate(phrase: string, locale: string, options?: any): string {
    const string = this.i18n.__({ phrase, locale }, options) as string;

    return string;
  }

  public async start(): Promise<void> {
    console.clear();
    logger.debug("Client starting...");

    await this.loadInteractionCommands(true);
    await this.loadEvents();
    await createMongoConnection();

    global.rankingBlacklist = [];

    this.login(process.env.DISCORD_CLIENT_TOKEN).catch((e) => {
      logger.error(e);
    });
  }
}
