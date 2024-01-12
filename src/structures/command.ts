import {
  type PermissionResolvable,
  type SlashCommandSubcommandsOnlyBuilder,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type SlashCommandBuilder,
} from "discord.js";

interface CommandOptions {
  clientPermissions?: PermissionResolvable;
  cooldown: number;
  guilds: string[];
  premium: boolean;
  ephemeral: boolean;
}

interface InteractionCommandOptions {
  data:
    | RESTPostAPIChatInputApplicationCommandsJSONBody
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  options: CommandOptions;
  run: (...args: any) => Promise<any>;
}

export default class InteractionCommand {
  data: InteractionCommandOptions["data"];
  options: InteractionCommandOptions["options"];
  run: InteractionCommandOptions["run"];

  constructor(options: InteractionCommandOptions) {
    this.data = options.data;
    this.options = options.options;
    this.run = options.run;
  }
}
