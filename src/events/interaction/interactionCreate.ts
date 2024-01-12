import {
  Events,
  CommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  AutocompleteInteraction,
  type ApplicationCommandOptionChoiceData,
} from "discord.js";
import { getGuild, getUser } from "../../misc/database/index.ts";
import { CustomEmbed } from "../../misc/util/index.ts";
import Fuse from "fuse.js";
import {
  SupportedLanguages,
  type InteractionArgs,
  type KakeleMonster,
} from "../../structures/misc.ts";
import DiscordEvent from "../../structures/event.ts";
import * as premium from "../../misc/premium/index.ts";
import {
  monsterSearchResultLimit,
  monsterSearchThreshold,
  playerSearchResultLimit,
  playerSearchThreshold,
} from "../../misc/constants/index.ts";
import { type IUser } from "../../database/schemas/user.ts";
import { logger } from "../../index.ts";

export default new DiscordEvent({
  name: Events.InteractionCreate,
  once: false,
  async run(client, interaction) {
    const args: InteractionArgs = {
      user: await getUser(interaction.user.id),
      guild:
        interaction.guildId != null
          ? await getGuild(interaction.guildId)
          : undefined,
      language: SupportedLanguages.EN,
    };

    if (interaction instanceof CommandInteraction) {
      const command = client.commands.get(interaction.commandName);

      if (command === undefined) {
        await interaction.reply({
          embeds: [
            new CustomEmbed()
              .setTitle(
                client.translate(
                  "INTERACTION_UNKNOWN_COMMAND_TITLE",
                  args.language,
                ),
              )
              .setDescription(
                client.translate(
                  "INTERACTION_UNKNOWN_COMMAND_DESCRIPTION",
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
              .setAuthor({
                name: "Kakele Biridim",
                iconURL: client.icons.ElderVampireBrooch,
              })
              .setColor(client.colors.DarkRed),
          ],
          ephemeral: true,
        });
        return;
      }

      if (!(await client.handleInteractionRateLimit(interaction))) return;

      const cooldown = client.handleInteractionCooldown(
        `${Events.InteractionCreate}-${interaction.commandName}-${interaction.user.id}`,
        command.options.cooldown * 1000,
      );

      if (typeof cooldown === "number") {
        await interaction.reply({
          embeds: [
            new CustomEmbed()
              .setTitle(
                client.translate(
                  "INTERACTION_COOLDOWN_COMMAND_TITLE",
                  args.language,
                ),
              )
              .setDescription(
                client.translate(
                  "INTERACTION_COOLDOWN_COMMAND_DESCRIPTION",
                  args.language,
                  { time: Math.round(cooldown / 1000) },
                ),
              )
              .setAuthor({
                name: "Kakele Biridim",
                iconURL: client.icons.ElderVampireBrooch,
              })
              .setColor(client.colors.DarkRed),
          ],
          ephemeral: true,
        });
        return;
      }

      args.language =
        SupportedLanguages[
          args.user.language ?? args.guild?.language ?? SupportedLanguages.EN
        ];

      if (args.guild?.blacklisted !== undefined) {
        const ban = args.guild.blacklisted.find(
          (x) =>
            (x.commands?.includes(interaction.commandName) ||
              x.commands?.includes("all")) &&
            new Date(x.expiration_date) > new Date(),
        );

        if (ban !== undefined) {
          await interaction.reply({
            embeds: [
              new CustomEmbed()
                .setTitle(
                  client.translate(
                    "INTERACTION_GUILD_BLACKLISTED_TITLE",
                    args.language,
                  ),
                )
                .setDescription(
                  client.translate(
                    "INTERACTION_GUILD_BLACKLISTED_DESCRIPTION",
                    args.language,
                  ),
                )
                .setAuthor({
                  name: "Kakele Biridim",
                  iconURL: client.icons.ElderVampireBrooch,
                })
                .setColor(client.colors.DarkRed),
            ],
            ephemeral: true,
          });
          return;
        }
      }

      if (args.user?.blacklisted !== undefined) {
        const ban = args.user.blacklisted.find(
          (x) =>
            (x.commands?.includes(interaction.commandName) ||
              x.commands?.includes("all")) &&
            new Date(x.expiration_date) > new Date(),
        );

        if (ban !== undefined) {
          await interaction.reply({
            embeds: [
              new CustomEmbed()
                .setTitle("Blacklisted User")
                .setDescription("You won't be able to use the bot commands.")
                .setAuthor({
                  name: "Kakele Biridim",
                  iconURL: client.icons.ElderVampireBrooch,
                })
                .setColor(client.colors.DarkRed),
            ],
            ephemeral: true,
          });
          return;
        }
      }

      if (command.options.premium) {
        const guildPayers =
          args.guild?.vip.payers?.filter((x: IUser) => {
            if (typeof x === "object") {
              if (new Date() < (x.vip_data?.expiration_date ?? 0)) {
                return true;
              }
            }
            return false;
          }) ?? [];

        if (
          guildPayers.length === 0 &&
          (args.user.vip_data.expiration_date == null ||
            new Date() > args.user.vip_data.expiration_date)
        ) {
          await interaction.reply({
            embeds: [
              new CustomEmbed()
                .setTitle(
                  client.translate("INTERACTION_ONLY_VIP_TITLE", args.language),
                )
                .setDescription(
                  client.translate(
                    "INTERACTION_ONLY_VIP_DESCRIPTION",
                    args.language,
                  ),
                )
                .setFooter({
                  text: client.translate(
                    "INTERACTION_ONLY_VIP_FOOTER",
                    args.language,
                  ),
                })
                .setAuthor({
                  name: "Kakele Biridim",
                  iconURL: client.icons.ElderVampireBrooch,
                })
                .setColor(client.colors.DarkRed),
            ],
            ephemeral: true,
          });
          return;
        }
      }

      await interaction.deferReply({ ephemeral: command.options.ephemeral });

      logger.info(
        Events.InteractionCreate,
        interaction.commandName,
        `userId-${interaction.user.id} ${
          interaction.guildId != null ? `guildId-${interaction.guildId}` : "DM"
        }`,
      );

      command.run(interaction, args).catch(async (e) => {
        logger.error(
          Events.InteractionCreate,
          `commandName-${interaction.commandName} userId-${
            interaction.user.id
          } ${
            interaction.guildId != null
              ? `guildId-${interaction.guildId}`
              : "DM"
          }`,
          e,
        );

        await interaction.followUp({
          embeds: [
            new CustomEmbed()
              .setTitle(
                client.translate("INTERACTION_ERROR_TITLE", args.language),
              )
              .setDescription(
                client.translate(
                  "INTERACTION_ERROR_DESCRIPTION",
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
      });
    } else if (interaction instanceof ButtonInteraction) {
      switch (interaction.customId) {
        case "JOIN_VIP_CONFIRM":
          await premium.showConfirmModal(client, interaction, args.language);
          break;

        case "JOIN_VIP_REJECT":
          await premium.showRejectModal(client, interaction, args.language);
          break;

        case "MARKETPLACE_VIEW_DM_FINISH":
          break;

        default:
          break;
      }
    } else if (interaction instanceof ModalSubmitInteraction) {
      switch (interaction.customId) {
        case "JOIN_VIP_CONFIRM_MODAL":
          await premium.handleConfirmModal(client, interaction);
          break;

        case "JOIN_VIP_REJECT_MODAL":
          await premium.handleRejectModal(client, interaction);
          break;

        default:
          break;
      }
    } else if (interaction instanceof AutocompleteInteraction) {
      const response: ApplicationCommandOptionChoiceData[] = [];

      if (interaction.commandName === "player") {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.value?.length === 0) return;

        const filter = {
          includeScore: true,
          shouldSort: true,
          threshold: playerSearchThreshold,
        };

        const fuse = new Fuse(global.todayPlayerDataNames, filter);
        const result = fuse
          .search(focusedOption.value)
          .slice(0, playerSearchResultLimit) as Array<{ item: string }>;

        if (result.length === 0) return;

        for (const { item } of result) {
          response.push({
            name: item,
            value: item,
          });
        }

        await interaction.respond(response);
      } else if (interaction.commandName === "monster-info") {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.value?.length === 0) return;

        args.language =
          SupportedLanguages[
            args.user.language ?? args.guild?.language ?? SupportedLanguages.EN
          ];

        const languageKey =
          args.language === SupportedLanguages.EN
            ? "name"
            : "language-" + args.language.toLowerCase();

        const filter = {
          includeScore: true,
          shouldSort: true,
          threshold: monsterSearchThreshold,
          keys: [languageKey],
        };

        const fuse = new Fuse(client.kakeleMonsters, filter);
        const result = fuse
          .search(focusedOption.value)
          .slice(0, monsterSearchResultLimit) as Array<{ item: KakeleMonster }>;

        if (result.length === 0) return;

        for (const { item } of result) {
          response.push({
            name: item[languageKey],
            value: item[languageKey],
          });
        }

        await interaction.respond(response);
      }
    }
  },
});
