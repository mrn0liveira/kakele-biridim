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
import fs from "fs";

import {
  CustomEmbed,
  capitalizeFirstLetter,
  getLevel,
} from "../../misc/util/index.ts";

import { client, logger } from "../../index.ts";

import Canvas from "canvas";

import type Biridim from "../../structures/client.ts";

export async function createRankingImage(
  client: Biridim,
  data: CharacterData[],
  yesterdayDdata: CharacterData[],
  category: string,
  server: string,
  language: SupportedLanguages,
): Promise<Canvas.Canvas> {
  function getVocationAttribute(): string {
    switch (category) {
      case "mage":
      case "alchemist":
        return "total_magic";

      case "warrior":
        return "total_armor";

      case "berserker":
      case "hunter":
        return "total_attack";

      default:
        return "total_attack";
    }
  }

  const categories: string[] = [
    "experience",
    "gold",
    "pet_points",
    "login_points",
    "achievements",
    "total_attack",
    "total_magic",
    "total_armor",
    "total_armor",
    "mage",
    "alchemist",
    "warrior",
    "berserker",
    "hunter",
  ];

  const obj = {
    server: client.i18n.__({
      phrase: `TOP_SERVER_${server.toUpperCase()}`,
      locale: language,
    }),

    category: client.i18n.__({
      phrase: `TOP_CATEGORY_${category.toUpperCase()}`,
      locale: language,
    }),

    aliase: capitalizeFirstLetter(category.replace("-", " ")),

    id: categories.indexOf(category),
  };

  const canvas =
    server === "global"
      ? Canvas.createCanvas(1280, 720)
      : Canvas.createCanvas(1136, 720);

  const background =
    server === "global"
      ? await Canvas.loadImage("./src/assets/top/1.png")
      : await Canvas.loadImage("./src/assets/top/2.png");

  const ctx = canvas.getContext("2d");

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const categoryIcon = await Canvas.loadImage(
    `./src/assets/top/${category}.png`,
  );

  ctx.drawImage(categoryIcon, 10, 600, 128, 128);

  ctx.globalAlpha = 0.8;

  ctx.font = "25pt Teko";
  ctx.fillStyle = "#03a5fc";

  ctx.fillText(
    client.translate("OFFICIAL_WEBSITE_AD", language).toUpperCase(),
    30,
    65,
  );

  ctx.font = "35pt Teko";

  ctx.fillStyle = "#54ff93";

  ctx.fillText(obj.server, 30, 105);

  ctx.fillStyle = "#d5eaf7";

  ctx.fillText(obj.category, 30, 145);

  const temp = data.slice();

  let yesterdayTemp;
  let yesterdayFormatted;

  if (yesterdayDdata) {
    yesterdayTemp = yesterdayDdata.slice();
  }

  if (obj.id <= 8) {
    const formatted = temp
      .sort(function (a, b) {
        if (Number(b[category] ?? 0) > Number(a[category])) return 1;
        if (Number(b[category] ?? 0) < Number(a[category])) return -1;

        return 0;
      })
      .slice(0, 100);

    if (yesterdayDdata) {
      yesterdayFormatted = yesterdayTemp
        .sort(function (a, b) {
          if (Number(b[category] ?? 0) > Number(a[category])) return 1;
          if (Number(b[category] ?? 0) < Number(a[category])) return -1;

          return 0;
        })
        .slice(0, 100);
    }

    ctx.font = "21pt Teko";

    ctx.fillStyle = "#54ff93";

    ctx.textAlign = "start";

    ctx.fillText(
      client.i18n.__({
        phrase: "RANKING_LEADERBOARD_NICKNAME",
        locale: language,
      }),
      480,
      53,
    );

    ctx.textAlign = "center";

    ctx.fillText(obj.category, 730, 53);

    ctx.fillText(
      client.i18n.__({
        phrase: "RANKING_LEADERBOARD_VOCATION",
        locale: language,
      }),
      910,
      53,
    );

    ctx.fillText(
      client.i18n.__({ phrase: "RANKING_LEADERBOARD_LEVEL", locale: language }),
      1040,
      53,
    );

    if (server === "global") {
      ctx.fillText(
        client.i18n.__({
          phrase: "RANKING_LEADERBOARD_SERVER",
          locale: language,
        }),
        1170,
        53,
      );
    }

    let y = 83;

    ctx.globalAlpha = 0.7;

    for (const player of formatted.slice(0, 30)) {
      if (yesterdayDdata) {
        const yesterdayPlayerIndex = yesterdayFormatted.findIndex(
          (p) =>
            p.name === player.name &&
            p.server === player.server &&
            p.vocation === player.vocation,
        );
        const playerIndex = formatted.findIndex(
          (p) =>
            p.name === player.name &&
            p.server === player.server &&
            p.vocation === player.vocation,
        );

        ctx.font = "10px HelveticaBold";

        if (
          yesterdayPlayerIndex === playerIndex &&
          !Number.isNaN(playerIndex)
        ) {
          ctx.fillStyle = "#ebd834";
          ctx.fillText("▬ 0", 420, y - 2);
        } else if (
          !Number.isNaN(yesterdayPlayerIndex) &&
          playerIndex < yesterdayPlayerIndex
        ) {
          ctx.fillStyle = "#6ad141";
          ctx.fillText(`▲ ${yesterdayPlayerIndex - playerIndex}`, 420, y - 2);
        } else {
          if (playerIndex === -1 || yesterdayPlayerIndex === -1) {
            ctx.fillStyle = "#2e2321";
            ctx.fillText(`▼ 0`, 420, y - 2);
          } else {
            ctx.fillStyle = "#d65f47";
            ctx.fillText(
              `▼ ${
                Number.isNaN(playerIndex) || Number.isNaN(yesterdayPlayerIndex)
                  ? 0
                  : playerIndex - yesterdayPlayerIndex
              }`,
              420,
              y - 2,
            );
          }
        }
      }

      ctx.textAlign = "start";

      const index = Number(formatted.indexOf(player));

      switch (index) {
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
          ctx.fillStyle = "#d4efff";

          ctx.font = "18px Helvetica";

          break;
      }

      if (
        fs.existsSync(
          `./src/assets/player/guilds/${player.guild}-${
            player.server ?? ""
          }.png`,
        )
      ) {
        const avatar = await Canvas.loadImage(
          `./src/assets/player/guilds/${player.guild}-${
            player.server ?? ""
          }.png`,
        );
        ctx.drawImage(avatar, 465, y - 14, 16, 16);
      } else {
        const avatar = await Canvas.loadImage(
          "./src/assets/player/guilds/default.png",
        );
        ctx.drawImage(avatar, 465, y - 14, 16, 16);
      }

      ctx.fillText(player.name, 490, y);

      ctx.fillStyle = "#d4efff";

      ctx.font = "18px Helvetica";

      ctx.fillText(String(index + 1), 440, y);

      ctx.textAlign = "center";

      ctx.fillText(new Intl.NumberFormat().format(player[category]), 730, y);

      ctx.fillText(
        capitalizeFirstLetter(player.vocation.toLowerCase()),
        910,
        y,
      );

      ctx.fillText(
        new Intl.NumberFormat().format(getLevel(parseInt(player.experience))),
        1040,
        y,
      );

      if (server === "global") {
        ctx.fillStyle = "#d4efff";

        ctx.fillText(capitalizeFirstLetter(player.server ?? ""), 1170, y);
      }

      y += 21;
    }
  } else {
    const formatted = temp
      .filter((a) => a.vocation === category.toUpperCase())
      .sort((a, b) => parseFloat(b.experience) - parseFloat(a.experience))
      .slice(0, 30);

    const yesterdayFormatted = yesterdayTemp
      .filter((a) => a.vocation === category.toUpperCase())
      .sort((a, b) => parseFloat(b.experience) - parseFloat(a.experience))
      .slice(0, 30);

    ctx.font = "21pt Teko";

    ctx.fillStyle = "#b5dcf5";

    ctx.textAlign = "start";

    ctx.fillText(
      client.i18n.__({
        phrase: "RANKING_LEADERBOARD_NICKNAME",
        locale: language,
      }),
      470,
      53,
    );

    ctx.textAlign = "center";

    ctx.fillText(
      client.i18n.__({
        phrase: "RANKING_LEADERBOARD_EXPERIENCE",
        locale: language,
      }),
      730,
      53,
    );

    ctx.fillText(
      client.i18n.__({ phrase: "RANKING_LEADERBOARD_LEVEL", locale: language }),
      890,
      53,
    );

    ctx.fillText(
      client.i18n.__({
        phrase: `TOP_CATEGORY_${getVocationAttribute().toUpperCase()}`,
        locale: language,
      }),
      1030,
      53,
    );

    if (server === "global") {
      ctx.fillText(
        client.i18n.__({
          phrase: "RANKING_LEADERBOARD_SERVER",
          locale: language,
        }),
        1170,
        53,
      );
    }

    let y = 83;

    ctx.globalAlpha = 0.7;

    for (const player of formatted.slice(0, 30)) {
      const yesterdayPlayerIndex = yesterdayFormatted.findIndex(
        (p) =>
          p.name === player.name &&
          p.server === player.server &&
          p.vocation === player.vocation,
      );
      const playerIndex = formatted.findIndex(
        (p) =>
          p.name === player.name &&
          p.server === player.server &&
          p.vocation === player.vocation,
      );

      ctx.font = "10px HelveticaBold";

      if (yesterdayPlayerIndex === playerIndex && !Number.isNaN(playerIndex)) {
        ctx.fillStyle = "#ebd834";
        ctx.fillText("▬ 0", 420, y - 2);
      } else if (
        !Number.isNaN(yesterdayPlayerIndex) &&
        playerIndex < yesterdayPlayerIndex
      ) {
        ctx.fillStyle = "#6ad141";
        ctx.fillText(`▲ ${yesterdayPlayerIndex - playerIndex}`, 420, y - 2);
      } else {
        if (playerIndex === -1 || yesterdayPlayerIndex === -1) {
          ctx.fillStyle = "#2e2321";
          ctx.fillText(`▼ 0`, 420, y - 2);
        } else {
          ctx.fillStyle = "#d65f47";
          ctx.fillText(
            `▼ ${
              Number.isNaN(playerIndex) || Number.isNaN(yesterdayPlayerIndex)
                ? 0
                : playerIndex - yesterdayPlayerIndex
            }`,
            420,
            y - 2,
          );
        }
      }

      ctx.textAlign = "start";

      const index = formatted.indexOf(player);

      switch (index) {
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
          ctx.fillStyle = "#d4efff";

          ctx.font = "18px Helvetica";

          break;
      }

      if (
        fs.existsSync(
          `./src/assets/player/guilds/${player.guild}-${
            player.server ?? ""
          }.png`,
        )
      ) {
        const avatar = await Canvas.loadImage(
          `./src/assets/player/guilds/${player.guild}-${
            player.server ?? ""
          }.png`,
        );
        ctx.drawImage(avatar, 465, y - 14, 16, 16);
      } else {
        const avatar = await Canvas.loadImage(
          "./src/assets/player/guilds/default.png",
        );
        ctx.drawImage(avatar, 465, y - 14, 16, 16);
      }

      ctx.fillText(player.name, 490, y);

      ctx.fillStyle = "#d4efff";

      ctx.font = "18px Helvetica";

      ctx.fillText(String(index + 1), 440, y);

      ctx.textAlign = "center";

      ctx.fillText(
        new Intl.NumberFormat().format(parseInt(player.experience)),
        730,
        y,
      );

      ctx.fillText(
        new Intl.NumberFormat().format(getLevel(parseInt(player.experience))),
        890,
        y,
      );

      ctx.fillText(
        new Intl.NumberFormat().format(player[getVocationAttribute()]),
        1030,
        y,
      );

      if (server === "global") {
        ctx.fillStyle = "#d4efff";

        ctx.fillText(capitalizeFirstLetter(player.server ?? ""), 1170, y);
      }

      y += 21;
    }
  }

  return canvas;
}

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Calculate the ranking of a category")
    .setDescriptionLocalizations({
      "es-ES": "Calcular el ranking de una categoría",
      "pt-BR": "Calcular o ranking de uma categoria",
      pl: "Oblicz ranking kategorii",
    })
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("The category to be used")
        .setDescriptionLocalizations({
          "es-ES": "La categoría a utilizar",
          "pt-BR": "A categoria a ser utilizada",
          pl: "Kategoria do użycia",
        })
        .addChoices(
          {
            name: "Experience",
            value: "experience",
            name_localizations: {
              "es-ES": "Experiencia",
              "pt-BR": "Experiência",
              pl: "Doświadczenie",
            },
          },
          {
            name: "Gold",
            value: "gold",
            name_localizations: {
              "es-ES": "Oro",
              "pt-BR": "Ouro",
              pl: "Złoto",
            },
          },
          {
            name: "Pet Points",
            value: "pet_points",
            name_localizations: {
              "es-ES": "Puntos de mascotas",
              "pt-BR": "Pontos de mascote",
              pl: "Punkty zwierząt domowych",
            },
          },
          {
            name: "Login Points",
            value: "login_points",
            name_localizations: {
              "es-ES": "Puntos de inicio de sesión",
              "pt-BR": "Pontos de login",
              pl: "Punkty logowania",
            },
          },
          {
            name: "Achievements",
            value: "achievements",
            name_localizations: {
              "es-ES": "Logros",
              "pt-BR": "Conquistas",
              pl: "Osiągnięcia",
            },
          },
          {
            name: "Attack",
            value: "total_attack",
            name_localizations: {
              "es-ES": "Ataque",
              "pt-BR": "Ataque",
              pl: "Atak",
            },
          },
          {
            name: "Magic",
            value: "total_magic",
            name_localizations: {
              "es-ES": "Magia",
              "pt-BR": "Magia",
              pl: "Magia",
            },
          },
          {
            name: "Armor",
            value: "total_armor",
            name_localizations: {
              "es-ES": "Armadura",
              "pt-BR": "Armadura",
              pl: "Pancerz",
            },
          },
          {
            name: "Mage",
            value: "mage",
            name_localizations: {
              "es-ES": "Mago",
              "pt-BR": "Mago",
              pl: "Mag",
            },
          },
          {
            name: "Alchemist",
            value: "alchemist",
            name_localizations: {
              "es-ES": "Alquimista",
              "pt-BR": "Alquimista",
              pl: "Alchemik",
            },
          },
          {
            name: "Warrior",
            value: "warrior",
            name_localizations: {
              "es-ES": "Guerrero",
              "pt-BR": "Guerreiro",
              pl: "Wojownik",
            },
          },
          {
            name: "Berserker",
            value: "berserker",
            name_localizations: {
              "es-ES": "Berserker",
              "pt-BR": "Berserker",
              pl: "Berserker",
            },
          },
          {
            name: "Hunter",
            value: "hunter",
            name_localizations: {
              "es-ES": "Cazador",
              "pt-BR": "Caçador",
              pl: "Myśliwy",
            },
          },
        )
        .setRequired(true),
    )

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
    const category = interaction.options.getString("category") ?? "";

    const server = interaction.options.getString("server") ?? "";

    const serverData: CharacterData[] =
      server === "global"
        ? global.todayPlayerData
        : global.todayPlayerData.filter((x) => x.server === server);

    const yesterdayServerData: CharacterData[] =
      server === "global"
        ? global.weeklyPlayerData
        : global.weeklyPlayerData.filter((x) => x.server === server);

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

    if (!serverData.some((x) => Number(x.experience) > 0)) {
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

    const image = await createRankingImage(
      client,
      serverData,
      yesterdayServerData,
      category,
      server,
      args.language,
    );

    await interaction.editReply({
      files: [
        {
          name: `${interaction.commandName}-${category}-${server}.png`,

          attachment: image.toBuffer(),
        },
      ],
    });
  },
});
