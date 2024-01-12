import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import InteractionCommand from "../../structures/command.ts";
import { CustomEmbed } from "../../misc/util/index.ts";
import { client, logger } from "../../index.ts";
import {
  type InteractionArgs,
  SupportedLanguages,
} from "../../structures/misc.ts";

import "dotenv/config";
import { Guild } from "../../database/schemas/guild.ts";
import User from "../../database/schemas/user.ts";
import { clearCache } from "../../misc/database/index.ts";

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName("language")
    .setDescription(
      "Sets the language to be used by the bot in guides and user commands.",
    )
    .setDescriptionLocalizations({
      "es-ES":
        "Establece el idioma que utilizará el bot en guías y comandos de usuario.",
      "pt-BR":
        "Define o idioma a ser usado pelo bot em guias e comandos de usuário.",
      pl: "Ustawia język, który będzie używany przez bota w przewodnikach i poleceniach użytkownika.",
    })
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription("Language to be used")
        .setRequired(true)
        .addChoices(
          { name: "English", value: "en" },
          { name: "Português", value: "pt" },
          { name: "Español", value: "es" },
          { name: "Polski", value: "pl" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("target")
        .setDescription("Target type to be configured")
        .setRequired(true)
        .addChoices(
          { name: "Guild", value: "guild" },
          { name: "User", value: "user" },
        ),
    ),
  options: {
    clientPermissions: [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.UseExternalEmojis,
      PermissionFlagsBits.AttachFiles,
    ],
    cooldown: 3,
    guilds: [],
    premium: false,
    ephemeral: true,
  },
  async run(
    interaction: ChatInputCommandInteraction<"cached">,
    args: InteractionArgs,
  ) {
    const language =
      SupportedLanguages[
        interaction.options.getString("language")?.toUpperCase() ?? ""
      ] ?? SupportedLanguages.EN;
    const target = interaction.options.getString("target");

    if (target === "guild" && args.guild === undefined) {
      return await interaction.editReply({
        embeds: [
          new CustomEmbed()
            .setTitle(
              client.translate("COMMAND_LANGUAGE_GUILD_ONLY_TITLE", language),
            )
            .setDescription(
              client.translate("INTERACTION_TIP_REPORT", language),
            )
            .setAuthor({
              name: "Kakele Biridim",
              iconURL: client.icons.ElderVampireBrooch,
            })
            .setColor(client.colors.DarkRed),
        ],
      });
    }

    async function setGuildLanguage(): Promise<void> {
      if (
        !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
      ) {
        await interaction.editReply({
          embeds: [
            new CustomEmbed()
              .setTitle(
                client.translate(
                  "COMMAND_LANGUAGE_MISSING_PERMISSION_TITLE",
                  language,
                ),
              )
              .setDescription(
                client.translate("INTERACTION_TIP_REPORT", language),
              )
              .setAuthor({
                name: "Kakele Biridim",
                iconURL: client.icons.ElderVampireBrooch,
              })
              .setColor(client.colors.DarkRed),
          ],
        });
        return;
      }

      logger.audit(
        "setGuildLanguage",
        "userId" + interaction.user.id,
        "guildId" + interaction.guildId,
        language,
      );

      await Guild.findOneAndUpdate({ id: args.guild?.id }, { language });

      clearCache(`guildId${interaction.guild.id}`);

      await interaction.editReply({
        embeds: [
          new CustomEmbed()
            .setTitle(
              client.translate(
                "COMMAND_LANGUAGE_GUILD_CHANGED_TITLE",
                language,
              ),
            )
            .setDescription(
              client.translate("INTERACTION_TIP_REPORT", language),
            )
            .setAuthor({
              name: "Kakele Biridim",
              iconURL: client.icons.ElderVampireBrooch,
            })
            .setColor(client.colors.LimeGreen),
        ],
      });
    }

    async function setUserLanguage(): Promise<void> {
      logger.audit("setUserLanguage", "userId" + interaction.user.id, language);

      await User.findOneAndUpdate({ id: args.user.id }, { language });

      clearCache(`userId${interaction.user.id}`);

      await interaction.editReply({
        embeds: [
          new CustomEmbed()
            .setTitle(
              client.translate("COMMAND_LANGUAGE_USER_CHANGED_TITLE", language),
            )
            .setDescription(
              client.translate("INTERACTION_TIP_REPORT", language),
            )
            .setAuthor({
              name: "Kakele Biridim",
              iconURL: client.icons.ElderVampireBrooch,
            })
            .setColor(client.colors.LimeGreen),
        ],
      });
    }

    switch (target) {
      case "guild":
        await setGuildLanguage();
        break;

      case "user":
        await setUserLanguage();
        break;

      default:
        break;
    }
  },
});
