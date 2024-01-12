import {
  type ChatInputCommandInteraction,
  type ButtonBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ActionRowBuilder,
} from "discord.js";
import InteractionCommand from "../../structures/command.ts";
import { CustomEmbed, calculatePremiumDays } from "../../misc/util/index.ts";
import { client, logger } from "../../index.ts";
import { type InteractionArgs } from "../../structures/misc.ts";

import "dotenv/config";
import {
  JOIN_VIP_CONFIRM,
  JOIN_VIP_REJECT,
} from "../../components/discordButton/index.ts";
import User from "../../database/schemas/user.ts";

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName("join-vip")
    .setDescription("Subscribe to the bot's VIP to access exclusive features.")
    .setDescriptionLocalizations({
      "es-ES": "Suscríbete al VIP del bot para acceder a funciones exclusivas.",
      "pt-BR": "Assine o VIP do bot para acessar recursos exclusivos.",
      pl: "Subskrybuj VIP bota, aby uzyskać dostęp do ekskluzywnych funkcji.",
    })
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("The image proving the sending of the coins."),
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
    const attachment = interaction.options.getAttachment("image");

    if (attachment == null) {
      return await interaction.editReply({
        embeds: [
          new CustomEmbed()
            .setTitle(
              client.translate(
                "COMMAND_JOIN_VIP_UNKNOWN_ATTACHMENT_TITLE",
                args.language,
              ),
            )
            .setDescription(
              client.translate(
                "COMMAND_JOIN_VIP_UNKNOWN_ATTACHMENT_DESCRIPTION",
                args.language,
                {
                  date:
                    args.user.vip_data?.expiration_date !== undefined
                      ? `<t:${Math.floor(
                          new Date(
                            args.user.vip_data.expiration_date,
                          ).getTime() / 1000,
                        )}>`
                      : "` `",
                },
              ),
            )
            .setAuthor({ name: "Kakele Biridim", iconURL: client.icons.Cherry })
            .setColor(client.colors.LimeGreen),
        ],
      });
    } else {
      try {
        await client.sendMessageToGuildChannel(
          process.env.DISCORD_JOIN_VIP_CHANNEL as string,
          {
            embeds: [
              new CustomEmbed()
                .setTitle(
                  client.translate(
                    "COMMAND_JOIN_VIP_CONFIRM_PAYMENT_TITLE",
                    args.language,
                  ),
                )
                .setImage(attachment.url)
                .setFooter({ text: interaction.user.id })
                .setAuthor({
                  name: "Kakele Biridim",
                  iconURL: client.icons.Cherry,
                })
                .setColor(client.colors.LimeGreen),
            ],
            components: [
              new ActionRowBuilder<ButtonBuilder>()
                .addComponents(JOIN_VIP_CONFIRM())
                .addComponents(JOIN_VIP_REJECT()),
            ],
          },
        );
        await interaction.editReply({
          embeds: [
            new CustomEmbed()
              .setTitle(
                client.translate(
                  "COMMAND_JOIN_VIP_SUCCESSFULLY_REQUESTED_TITLE",
                  args.language,
                ),
              )
              .setDescription(
                client.translate(
                  "COMMAND_JOIN_VIP_SUCCESSFULLY_REQUESTED_DESCRIPTION",
                  args.language,
                ),
              )
              .setFooter({
                text: client.translate(
                  "COMMAND_JOIN_VIP_SUCCESSFULLY_REQUESTED_FOOTER",
                  args.language,
                ),
              })
              .setAuthor({
                name: "Kakele Biridim",
                iconURL: client.icons.Cherry,
              })
              .setColor(client.colors.LimeGreen),
          ],
        });

        const user =
          (await User.findOne({ id: interaction.user.id })) ?? args.user;

        const now = new Date();

        const vipExpiration = user.vip_data.expiration_date ?? 0;
        const expirationDate =
          now > vipExpiration ? now : new Date(vipExpiration);

        const result = calculatePremiumDays(expirationDate, 5);

        user.vip_data.expiration_date = result.premiumExpiration;

        await user.save();
        logger.audit("VIP request", interaction.user.id, attachment.url);
      } catch (error) {
        logger.error("The VIP payment request could not be completed", error);

        return await interaction.editReply({
          embeds: [
            new CustomEmbed()
              .setTitle(
                client.translate("COMMAND_JOIN_VIP_ERROR_TITLE", args.language),
              )
              .setDescription(
                client.translate(
                  "COMMAND_JOIN_VIP_ERROR_DESCRIPTION",
                  args.language,
                ),
              )
              .setAuthor({
                name: "Kakele Biridim",
                iconURL: client.icons.Cherry,
              })
              .setColor(client.colors.DarkRed),
          ],
        });
      }
    }
  },
});
