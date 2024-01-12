import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  type ButtonBuilder,
  type MessageComponentInteraction,
} from "discord.js";
import InteractionCommand from "../../structures/command.ts";
import { CustomEmbed } from "../../misc/util/index.ts";
import { client, logger } from "../../index.ts";
import { type InteractionArgs } from "../../structures/misc.ts";

import "dotenv/config";
import {
  VIP_SETTINGS_BUTTON_ADD,
  VIP_SETTINGS_BUTTON_REMOVE,
} from "../../components/discordButton/index.ts";
import { Guild } from "../../database/schemas/guild.ts";
import { clearCache } from "../../misc/database/index.ts";

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName("vip-settings")
    .setDescription(
      "Configure the assignment of VIP status to users in guilds.",
    )
    .setDescriptionLocalizations({
      "es-ES":
        "Configura la asignación del estado VIP a usuarios en servidores.",
      "pt-BR":
        "Configure a atribuição do status VIP para usuários em servidores.",
      pl: "Skonfiguruj przypisywanie statusu VIP użytkownikom na serwerach.",
    })
    .setDMPermission(false),
  options: {
    clientPermissions: [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.UseExternalEmojis,
      PermissionFlagsBits.AttachFiles,
    ],
    cooldown: 3,
    guilds: [],
    premium: true,
    ephemeral: true,
  },
  async run(
    interaction: ChatInputCommandInteraction<"cached">,
    args: InteractionArgs,
  ) {
    const isPayer = new Date() > (args.user.vip_data.expiration_date ?? 0);

    await interaction
      .editReply({
        embeds: [
          new CustomEmbed()
            .setTitle(
              client.translate("COMMAND_VIP_SETTINGS_TITLE", args.language),
            )
            .setDescription(
              client.translate(
                "COMMAND_VIP_SETTINGS_DESCRIPTION",
                args.language,
              ),
            )
            .setFooter({
              text: !isPayer
                ? client.translate(
                    "COMMAND_VIP_SETTINGS_PAYERS_FOOTER",
                    args.language,
                  )
                : client.translate(
                    "COMMAND_VIP_SETTINGS_ONLY_PAYERS_FOOTER",
                    args.language,
                  ),
            })
            .setAuthor({
              name: "Kakele Biridim",
              iconURL: client.icons.ElderVampireBrooch,
            })
            .setColor(client.colors.LimeGreen),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              VIP_SETTINGS_BUTTON_ADD(
                client.translate("VIP_SETTINGS_BUTTON_ADD", args.language),
              ).setDisabled(isPayer),
            )
            .addComponents(
              VIP_SETTINGS_BUTTON_REMOVE(
                client.translate("VIP_SETTINGS_BUTTON_REMOVE", args.language),
              ).setDisabled(isPayer),
            ),
        ],
      })
      .then((message) => {
        const interactionCollector = message.createMessageComponentCollector({
          time: 60000,
        });

        async function addUserInGuild(
          res: MessageComponentInteraction,
        ): Promise<void> {
          await res.deferUpdate();

          const guilds = await Guild.find({ "vip.payers": args.user });

          if (guilds !== undefined) {
            const filteredGuilds = guilds.filter(
              (x) => x.id !== interaction.guild.id,
            );

            if (filteredGuilds.length > 0) {
              await interaction.editReply({
                components: [],
                embeds: [
                  new CustomEmbed()
                    .setTitle(
                      client.translate(
                        "COMMAND_VIP_SETTINGS_ONLY_ONE_GUILD_TITLE",
                        args.language,
                      ),
                    )
                    .setDescription(
                      client.translate("INTERACTION_TIP_REPORT", args.language),
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
          }

          const guild = await Guild.findOne({ id: interaction.guild.id });

          if (guild == null)
            throw new Error("Invalid Guild " + interaction.guild.id);

          const index = guild.vip.payers.find(
            (x) => x?._id?.valueOf() === args.user._id.valueOf(),
          );

          if (index == null) {
            logger.audit(
              "addUserInGuild",
              "userId" + interaction.user.id,
              `guildId${String(args.user._id)}`,
            );

            guild.vip.payers.push(args.user._id);

            await guild.save();

            clearCache(`guildId${interaction.guild.id}`);

            await interaction.editReply({
              components: [],
              embeds: [
                new CustomEmbed()
                  .setTitle(
                    client.translate(
                      "COMMAND_VIP_SETTINGS_USER_ADDED_TITLE",
                      args.language,
                    ),
                  )
                  .setDescription(
                    client.translate("INTERACTION_TIP_REPORT", args.language),
                  )
                  .setAuthor({
                    name: "Kakele Biridim",
                    iconURL: client.icons.ElderVampireBrooch,
                  })
                  .setColor(client.colors.LimeGreen),
              ],
            });
            return;
          }

          await interaction.editReply({
            components: [],
            embeds: [
              new CustomEmbed()
                .setTitle(
                  client.translate(
                    "COMMAND_VIP_SETTINGS_ALREADY_ADDED_TITLE",
                    args.language,
                  ),
                )
                .setDescription(
                  client.translate("INTERACTION_TIP_REPORT", args.language),
                )
                .setAuthor({
                  name: "Kakele Biridim",
                  iconURL: client.icons.ElderVampireBrooch,
                })
                .setColor(client.colors.DarkRed),
            ],
          });
        }

        async function removeUserInGuild(
          res: MessageComponentInteraction,
        ): Promise<void> {
          await res.deferUpdate();

          const guilds = await Guild.find({ "vip.payers": args.user });

          if (guilds === undefined) {
            await interaction.editReply({
              components: [],
              embeds: [
                new CustomEmbed()
                  .setTitle(
                    client.translate(
                      "COMMAND_VIP_SETTINGS_USER_NOT_ADDED_TITLE",
                      args.language,
                    ),
                  )
                  .setDescription(
                    client.translate(
                      "COMMAND_VIP_SETTINGS_USER_NOT_ADDED_DESCRIPTION",
                      args.language,
                    ),
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

          logger.audit("removeUserInGuild", "userId" + interaction.user.id);

          for (let index = 0; index < guilds.length; index += 1) {
            await Guild.findOneAndUpdate(
              { id: guilds[index].id },
              {
                "vip.payers": guilds[index].vip.payers.filter(
                  (x) => x?.valueOf() !== args.user._id.valueOf(),
                ),
              },
            );
          }

          await interaction.editReply({
            components: [],
            embeds: [
              new CustomEmbed()
                .setTitle(
                  client.translate(
                    "COMMAND_VIP_SETTINGS_USER_REMOVED_TITLE",
                    args.language,
                  ),
                )
                .setDescription(
                  client.translate("INTERACTION_TIP_REPORT", args.language),
                )
                .setAuthor({
                  name: "Kakele Biridim",
                  iconURL: client.icons.ElderVampireBrooch,
                })
                .setColor(client.colors.DarkRed),
            ],
          });
        }

        interactionCollector.on("collect", async (interactionResponse) => {
          if (interactionResponse.user.id === interaction.user.id) {
            switch (interactionResponse.customId) {
              case "VIP_SETTINGS_BUTTON_ADD":
                await addUserInGuild(interactionResponse);
                break;

              case "VIP_SETTINGS_BUTTON_REMOVE":
                await removeUserInGuild(interactionResponse);
                break;

              default:
                break;
            }
          }
        });
        interactionCollector.on("end", () => {
          interaction.deleteReply().catch(() => {});
        });
      });
  },
});
