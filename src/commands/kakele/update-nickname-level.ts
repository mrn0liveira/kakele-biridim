import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import InteractionCommand from "../../structures/command.ts";
import { type GuildInteractionArgs } from "../../structures/misc.ts";
import { CustomEmbed, getLevel } from "../../misc/util/index.ts";
import { client, logger } from "../../index.ts";

function lowerCase(text: any): string {
  if (typeof text === "string") return text.toString().toLowerCase();
  return text;
}

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName("update-nickname-level")
    .setDescription(
      "Change your nickname on Discord according to the character's name in-game.",
    )
    .setDescriptionLocalizations({
      "es-ES":
        "Cambie su apodo en Discord de acuerdo con el nombre del personaje en el juego.",
      "pt-BR":
        "Altere seu apelido no Discord de acordo com o nome do personagem no jogo.",
      pl: "Zmień swój pseudonim na Discordzie zgodnie z imieniem postaci w grze.",
    })
    .setDMPermission(false),
  options: {
    clientPermissions: [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.UseExternalEmojis,
      PermissionFlagsBits.ManageNicknames,
    ],
    cooldown: 3,
    guilds: [],
    premium: false,
    ephemeral: true,
  },
  async run(
    interaction: ChatInputCommandInteraction<"cached">,
    args: GuildInteractionArgs,
  ) {
    const member = interaction.member.displayName;

    if (
      typeof global.todayPlayerData !== "object" ||
      global.todayPlayerData?.length === 0
    ) {
      await interaction.editReply({
        embeds: [
          new CustomEmbed()
            .setTitle(
              client.translate("RANKING_UNKNOWN_SERVER_DATA", args.language),
            )
            .setDescription(
              client.translate(
                "RANKING_UNKNOWN_SERVER_DATA_DESCRIPTION",
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

    const array = member.split(" ");
    let result;

    for (let index = 0; index < array.length; index += 1) {
      const nickname = array[index];

      result = global.todayPlayerData.find(
        (c) => lowerCase(c.name) === lowerCase(nickname),
      );

      if (result !== undefined) {
        break;
      }
    }

    if (result === undefined) {
      await interaction.editReply({
        embeds: [
          new CustomEmbed()
            .setTitle(
              client.translate(
                "UPDATE_NICKNAME_LEVEL_UNKNOWN_PLAYER_TITLE",
                args.language,
              ),
            )
            .setDescription(
              client.translate(
                "UPDATE_NICKNAME_LEVEL_UNKNOWN_PLAYER_DESCRIPTION",
                args.language,
                { player: member },
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

    const newNickname = member.replace(
      /\d+/g,
      `${getLevel(result.experience)}`,
    );

    interaction.member
      .setNickname(newNickname)
      .then(async () => {
        await interaction.editReply({
          embeds: [
            new CustomEmbed()
              .setTitle(
                client.translate(
                  "UPDATE_NICKNAME_LEVEL_SUCESS_TITLE",
                  args.language,
                ),
              )
              .setDescription(
                client.translate(
                  "UPDATE_NICKNAME_LEVEL_SUCESS_DESCRIPTION",
                  args.language,
                  { player: result.name, level: getLevel(result.experience) },
                ),
              )
              .setAuthor({
                name: "Kakele Biridim",
                iconURL: client.icons.ElderVampireBrooch,
              })
              .setColor(client.colors.GoldenRod),
          ],
        });
      })
      .catch(async (e) => {
        logger.error(
          "Unable to change nickname",
          `userID-${interaction.member.id}`,
          `guildID-${interaction.guildId}`,
          `error-${JSON.stringify(e)}`,
        );

        await interaction.editReply({
          embeds: [
            new CustomEmbed()
              .setTitle(
                client.translate(
                  "UPDATE_NICKNAME_LEVEL_ERROR_TITLE",
                  args.language,
                ),
              )
              .setDescription(
                client.translate(
                  "UPDATE_NICKNAME_LEVEL_ERROR_DESCRIPTION",
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
  },
});
