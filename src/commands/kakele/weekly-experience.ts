import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import InteractionCommand from "../../structures/command.ts";
import {
  type SupportedLanguages,
  type CharacterData,
  type InteractionArgs,
} from "../../structures/misc.ts";
import {
  CustomEmbed,
  capitalizeFirstLetter,
  getExperienceToNextLevel,
  getLevel,
} from "../../misc/util/index.ts";
import { client, logger } from "../../index.ts";
import type Biridim from "../../structures/client.ts";
import { fillMixedText } from "../../misc/canvas/index.ts";
import { type Canvas, createCanvas, loadImage } from "canvas";
import fs from "fs";

const compare = (a, b) => Number(b.progress) - Number(a.progress);

export async function createWeeklyRankingImage(
  client: Biridim,
  data: CharacterData[],
  server: string,
  language: SupportedLanguages,
  timestamp: { new: number; old: number },
): Promise<Canvas> {
  function getProgress(player: CharacterData): number {
    const experienceToNextLevel = getExperienceToNextLevel(
      getLevel(Number(player.experience)),
    );
    return (
      Math.floor((Number(player.progress) / experienceToNextLevel) * 100) / 100
    );
  }

  const canvasWidth = server === "global" ? 1280 : 1136;
  const canvas = createCanvas(canvasWidth, 720);
  const backgroundImagePath =
    server === "global"
      ? "./src/assets/weekly-experience/2.png"
      : "./src/assets/weekly-experience/3.png";
  const background = await loadImage(backgroundImagePath);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const obj = {
    server: client.i18n.__({
      phrase: `TOP_SERVER_${server.toUpperCase()}`,
      locale: language,
    }),
  };

  ctx.globalAlpha = 0.8;

  ctx.font = "25pt Teko";
  ctx.fillStyle = "#90f542";
  ctx.fillText(
    client.translate("OFFICIAL_WEBSITE_AD", language).toUpperCase(),
    30,
    65,
  );

  ctx.font = "35pt Teko";
  ctx.fillStyle = "#54ff93";
  ctx.fillText(
    client.i18n.__({ phrase: "WEEKLY_EXPERIENCE_TITLE", locale: language }),
    30,
    105,
  );

  ctx.fillStyle = "#ffecd6";
  ctx.fillText(obj.server, 30, 145);

  const formatted = data
    .sort(compare)
    .filter((player) => !global.rankingBlacklist.includes(player.name))
    .filter((player) => Number(player.progress) > 0)
    .slice(0, 30);

  ctx.textAlign = "center";
  ctx.fillStyle = "#54ff93";
  ctx.font = "21pt Teko";

  ctx.fillText(
    client.i18n.__({
      phrase: "RANKING_LEADERBOARD_NICKNAME",
      locale: language,
    }),
    520,
    47,
  );
  ctx.fillText(
    client.i18n.__({
      phrase: "RANKING_LEADERBOARD_PROGRESS",
      locale: language,
    }),
    720,
    47,
  );
  ctx.fillText(
    client.i18n.__({
      phrase: "RANKING_LEADERBOARD_EXPERIENCE",
      locale: language,
    }),
    880,
    47,
  );
  ctx.fillText(
    client.i18n.__({
      phrase: "RANKING_LEADERBOARD_VOCATION",
      locale: language,
    }),
    1035,
    47,
  );

  if (server === "global") {
    ctx.fillText(
      client.i18n.__({
        phrase: "RANKING_LEADERBOARD_SERVER",
        locale: language,
      }),
      1170,
      47,
    );
  }

  ctx.textAlign = "start";
  ctx.fillStyle = "#dbc4ab";
  ctx.font = "12px Helvetica";

  if (
    !Number.isNaN(Date.parse(new Date(timestamp.old)?.toLocaleDateString()))
  ) {
    ctx.fillText(new Date(timestamp.old).toUTCString(), 20, 690);
  }

  if (
    !Number.isNaN(Date.parse(new Date(timestamp.new)?.toLocaleDateString()))
  ) {
    ctx.fillText(new Date(timestamp.new).toUTCString(), 20, 710);
  }

  ctx.textAlign = "start";
  ctx.fillStyle = "#dbc4ab";
  ctx.font = "18px Helvetica";

  let y = 77;

  for (let i = 0; i < formatted.length; i += 1) {
    switch (i) {
      case 0:
        ctx.fillStyle = "#ffd700";
        ctx.font = "18px HelveticaBold";
        break;
      case 1:
        ctx.fillStyle = "#f2fcfc";
        ctx.font = "18px HelveticaBold";
        break;
      case 2:
        ctx.fillStyle = "#f2a355";
        ctx.font = "18px HelveticaBold";
        break;
      default:
        ctx.fillStyle = "#dbc4ab";
        ctx.font = "18px Helvetica";
        break;
    }

    if (
      fs.existsSync(
        `./src/assets/player/guilds/${formatted[i].guild}-${
          formatted[i].server ?? ""
        }.png`,
      )
    ) {
      const avatar = await loadImage(
        `./src/assets/player/guilds/${formatted[i].guild}-${
          formatted[i].server ?? ""
        }.png`,
      );
      ctx.drawImage(avatar, 460, y - 14, 16, 16);
    } else {
      const avatar = await loadImage("./src/assets/player/guilds/default.png");
      ctx.drawImage(avatar, 460, y - 14, 16, 16);
    }

    ctx.textAlign = "start";
    ctx.fillText(formatted[i].name, 480, y);
    ctx.font = "18px Helvetica";
    ctx.fillStyle = "#dbc4ab";
    ctx.fillText(String(i + 1), 420, y);

    const level = getLevel(Number(formatted[i].experience));
    const progress = getProgress(formatted[i]);

    ctx.textAlign = "center";
    ctx.fillText(
      new Intl.NumberFormat().format(Number(formatted[i].progress)),
      880,
      y,
    );
    ctx.fillText(
      client.i18n.__({
        phrase: `TOP_CATEGORY_${formatted[i].vocation}`,
        locale: language,
      }),
      1030,
      y,
    );

    if (server === "global") {
      ctx.fillText(capitalizeFirstLetter(formatted[i].server ?? ""), 1170, y);
    }

    ctx.textAlign = "start";

    fillMixedText(
      ctx,
      [
        {
          text: level.toString(),
          fillStyle: "#dbc4ab",
          font: "16px HelveticaBoldMS",
        },
        {
          text: `+${progress}`,
          fillStyle: "#6bff30",
          font: "12px HelveticaBoldMS",
        },
      ],
      690,
      y,
    );

    y += 21;
  }

  return canvas;
}

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName("weekly-experience")
    .setDescription("Calculate the weekly experience progress ranking")
    .setDescriptionLocalizations({
      "es-ES": "Calcular el ranking semanal de progreso de experiencia",
      "pt-BR": "Calcular o ranking semanal de progresso de experiência",
      pl: "Oblicz ranking tygodniowego postępu doświadczenia",
    })
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("The server to be used")
        .setDescriptionLocalizations({
          "es-ES": "El servidor a utilizar",
          "pt-BR": "O servidor a ser utilizado",
          pl: "Serwer do użycia",
        })

        .addChoices(
          {
            name: "South America - Red",
            value: "red",
            name_localizations: {
              "es-ES": "Sudamérica - Rojo",
              "pt-BR": "América do Sul - Vermelho",
              pl: "Ameryka Południowa - Czerwony",
            },
          },
          {
            name: "South America - Blue",
            value: "blue",
            name_localizations: {
              "es-ES": "Sudamérica - Azul",
              "pt-BR": "América do Sul - Azul",
              pl: "Ameryka Południowa - Niebieski",
            },
          },
          {
            name: "South America - Yellow",
            value: "yellow",
            name_localizations: {
              "es-ES": "Sudamérica - Amarillo",
              "pt-BR": "América do Sul - Amarelo",
              pl: "Ameryka Południowa - Żółty",
            },
          },
          {
            name: "South America - Pink",
            value: "pink",
            name_localizations: {
              "es-ES": "Sudamérica - Rosa",
              "pt-BR": "América do Sul - Rosa",
              pl: "Ameryka Południowa - Różowy",
            },
          },
          {
            name: "North America - Lime",
            value: "lime",
            name_localizations: {
              "es-ES": "Norteamérica - Lima",
              "pt-BR": "América do Norte - Limão",
              pl: "Ameryka Północna - Zielony",
            },
          },
          {
            name: "North America - Violet",
            value: "violet",
            name_localizations: {
              "es-ES": "Norteamérica - Violeta",
              "pt-BR": "América do Norte - Violeta",
              pl: "Ameryka Północna - Fioletowy",
            },
          },
          {
            name: "Southeast Asia - White",
            value: "white",
            name_localizations: {
              "es-ES": "Sudeste de Asia - Blanco",
              "pt-BR": "Sudeste Asiático - Branco",
              pl: "Azja Południowo-Wschodnia - Biały",
            },
          },
          {
            name: "Europe - Green",
            value: "green",
            name_localizations: {
              "es-ES": "Europa - Verde",
              "pt-BR": "Europa - Verde",
              pl: "Europa - Zielony",
            },
          },
          {
            name: "Europe - Orange",
            value: "orange",
            name_localizations: {
              "es-ES": "Europa - Naranja",
              "pt-BR": "Europa - Laranja",
              pl: "Europa - Pomarańczowy",
            },
          },
          {
            name: "Europe Gold",
            value: "gold",
            name_localizations: {
              "es-ES": "Europa - Oro",
              "pt-BR": "Europa - Ouro",
              pl: "Europa - Złoto",
            },
          },
          {
            name: "Global Ranking",
            value: "global",
            name_localizations: {
              "es-ES": "Ranking Global",
              "pt-BR": "Ranking Global",
              pl: "Ranking Globalny",
            },
          },
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("guild")
        .setDescription("The Guild to be filtered")
        .setDescriptionLocalizations({
          "es-ES": "El gremio a filtrar",
          "pt-BR": "A Guilda a ser filtrada",
          pl: "Gildia do przefiltrowania",
        }),
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
    ephemeral: false,
  },
  async run(
    interaction: ChatInputCommandInteraction<"cached">,
    args: InteractionArgs,
  ) {
    const server = interaction.options.getString("server") ?? "";
    const guild = interaction.options.getString("guild")?.toLowerCase() ?? "";

    let serverData: CharacterData[] = [];

    if (guild.length > 0) {
      serverData =
        server === "global"
          ? global.weeklyPlayerData?.slice()
          : global.weeklyPlayerData
              ?.slice()
              .filter((x) => x.server === server && x.guild === guild);
    } else {
      serverData =
        server === "global"
          ? global.weeklyPlayerData?.slice()
          : global.weeklyPlayerData?.slice().filter((x) => x.server === server);
    }

    if (
      guild.length > 0 &&
      (serverData === undefined || serverData?.length === 0)
    ) {
      return await interaction.editReply({
        embeds: [
          new CustomEmbed()
            .setTitle(
              client.translate("RANKING_NO_DATA_FILTERED", args.language),
            )
            .setDescription(
              client.translate(
                "RANKING_NO_DATA_FILTERED_DESCRIPTION",
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
    }

    if (serverData === undefined || serverData?.length === 0) {
      return await interaction.editReply({
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
    }

    if (!serverData.some((x) => Number(x.progress) > 0)) {
      await interaction.editReply({
        embeds: [
          new CustomEmbed()
            .setTitle(
              client.translate(
                "RANKING_NO_PROGRESS_SERVER_DATA",
                args.language,
              ),
            )
            .setDescription(
              client.translate(
                "RANKING_NO_PROGRESS_SERVER_DATA_DESCRIPTION",
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

      logger.error(
        `${interaction.commandName} No progress on ${server} server`,
      );

      return;
    }

    const image = await createWeeklyRankingImage(
      client,
      JSON.parse(JSON.stringify(serverData)),
      server,
      args.language,
      {
        old: global.weeklyPlayerData.timestamp.old,
        new: global.dailyPlayerData.timestamp.new,
      },
    );

    await interaction.editReply({
      files: [
        {
          name: `${interaction.commandName}-${server}.png`,
          attachment: image.toBuffer(),
        },
      ],
    });
  },
});
