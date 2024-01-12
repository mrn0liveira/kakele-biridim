import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import InteractionCommand from "../../structures/command.ts";
import { CustomEmbed } from "../../misc/util/index.ts";
import { client, logger } from "../../index.ts";
import { type InteractionArgs } from "../../structures/misc.ts";

import "dotenv/config";

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("Command used to report errors or suggest changes.")
    .setDescriptionLocalizations({
      "es-ES": "Comando utilizado para informar errores o sugerir cambios.",
      "pt-BR": "Comando usado para relatar erros ou sugerir alterações.",
      pl: "Polecenie służące do zgłaszania błędów lub sugestii zmian.",
    })
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Text that will be sent to the developer.")
        .setMinLength(20)
        .setRequired(true),
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
    const string = interaction.options.getString("text");

    logger.audit("report", interaction.user.id, string);

    async function sendNotification(...props: any[]): Promise<void> {
      await fetch(process.env.NTFY_REPORT_URL as string, {
        method: "POST",
        body: props.join("\n"),
      });
    }

    await sendNotification(interaction.user.id, string);

    await interaction.editReply({
      embeds: [
        new CustomEmbed()
          .setTitle(client.translate("COMMAND_REPORT_TITLE", args.language))
          .setDescription(
            client.translate("COMMAND_REPORT_DESCRIPTION", args.language, {
              date:
                args.user.vip_data?.expiration_date !== undefined
                  ? `<t:${Math.floor(
                      new Date(args.user.vip_data.expiration_date).getTime() /
                        1000,
                    )}>`
                  : "` `",
            }),
          )
          .setAuthor({ name: "Kakele Biridim", iconURL: client.icons.Cherry })
          .setColor(client.colors.LimeGreen),
      ],
    });
  },
});
