import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  type StringSelectMenuBuilder,
  ComponentType,
} from "discord.js";
import InteractionCommand from "../../structures/command.ts";
import { SupportedLanguages, type InteractionArgs, type KakeleMonster } from "../../structures/misc.ts";
import Fuse from "fuse.js";
import { CustomEmbed } from "../../misc/util/index.ts";
import { client } from "../../index.ts";
import { MONSTER_RESULT_SELECTION_MENU } from "../../components/discordMenu/index.ts";
import { cachedImages } from "../../misc/canvas/index.ts";
import { createCanvas, type Canvas, loadImage } from "canvas";
import fs from "fs";
import type Biridim from "../../structures/client.ts";

const monsterSearchThreshold = 0.4;
const monsterSearchResultLimit = 12;

const BACKGROUND_IMAGE_PATHS = {
  Dark: "./src/assets/monster-info/dark.png",
  Light: "./src/assets/monster-info/light.png",
  Nature: "./src/assets/monster-info/nature.png",
  Neutral: "./src/assets/monster-info/neutral.png",
};

async function createMonsterInfoImage(client: Biridim, monster: KakeleMonster, languageCode: SupportedLanguages): Promise<Canvas> {
  const languageKey = languageCode === SupportedLanguages.EN ? "name" : "language-" + languageCode.toLowerCase();

  const canvas = createCanvas(cachedImages.playerInfo.width, cachedImages.playerInfo.height);
  const ctx = canvas.getContext("2d");

  const backgroundImagePath = BACKGROUND_IMAGE_PATHS[monster.energy] ?? BACKGROUND_IMAGE_PATHS.Neutral;

  ctx.drawImage(await loadImage(backgroundImagePath), 0, 0, canvas.width, canvas.height);

  const monsterImageFilePath = `./src/assets/sprites/monsters/${monster.name.replaceAll("'", "")}.png`;

  if (fs.existsSync(monsterImageFilePath)) {
    const monsterImage = await loadImage(monsterImageFilePath);

    const ratio = monsterImage.naturalWidth / monsterImage.naturalHeight;
    const { width } = canvas;
    const height = width / ratio;

    if (ratio === 1) {
      ctx.drawImage(monsterImage, 130, 150, 360, 360);
    } else {
      ctx.drawImage(monsterImage, 15, 160, width / 3, height / 3);
    }
  }

  const rawLoot = monster.loot || [];

  let count = 0;
  let itemX = 635;
  let itemY = 410;

  let loot: Array<{ name: string; rarity: number; level: number; value: number }> = [];

  rawLoot.forEach((drop) => {
    const item = client.kakeleItems.find((x) => x.name === drop);

    if (item !== undefined) {
      loot.push({
        name: item.name,
        rarity: Number(item.rarity) ?? 0,
        level: Number(item.level) ?? 0,
        value: Number(item.value) ?? 0,
      });
    }
  });

  loot = loot.sort((a, b) => b.value - a.value || b.rarity - a.rarity);
  for (const item of loot) {
    if (count > 14) {
      itemY += 70;
      itemX = 635;
      count = 0;
    }

    if (fs.existsSync(`./src/assets/sprites/items/${item.name.replaceAll("'", "")}.png`)) {
      const avatar = await loadImage(`./src/assets/sprites/items/${item.name.replaceAll("'", "")}.png`);
      ctx.drawImage(avatar, itemX, itemY, 64, 64);
      itemX += 64;
    }

    switch (item.rarity) {
      case 1:
        ctx.fillStyle = "#c9c9c9";
        break;

      case 2:
        ctx.fillStyle = "#3486eb";
        break;

      case 3:
        ctx.fillStyle = "#d6eb34";
        break;

      case 4:
        ctx.fillStyle = "#eb4034";
        break;

      case 5:
        ctx.fillStyle = "#db5ac8";
        break;

      default:
        break;
    }

    ctx.beginPath();
    ctx.lineWidth = 2;

    ctx.arc(itemX - 32, itemY + 68, 4, 0, 2 * Math.PI, false);
    ctx.fill();
    count += 1;
  }

  if (monster.boss === true) {
    ctx.font = "25pt HelveticaBold";
    ctx.fillStyle = "#b8b8b8";
    ctx.fillText("Boss", 620, monster[languageKey].length <= 16 ? 138 : 138);
  }

  ctx.font = "60pt Teko";

  ctx.fillStyle = "#b8b8b8";
  ctx.fillText(monster[languageKey], 620, 200);

  ctx.font = "25pt HelveticaBold";
  ctx.fillStyle = "#ff5f4f";
  ctx.fillText(new Intl.NumberFormat().format(monster.health), 670, 237);

  ctx.fillStyle = "#ffe536";
  ctx.fillText(new Intl.NumberFormat().format(monster.experience), 670, 283);

  ctx.fillStyle = "#de9021";
  ctx.fillText(new Intl.NumberFormat().format(monster.gold), 670, 331);

  return canvas;
}

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName("monster-info")
    .setDescription("Get information about a monster.")
    .setDescriptionLocalizations({
      "es-ES": "Obtener información sobre un monstruo.",
      "pt-BR": "Obter informações sobre um monstro.",
      pl: "Pobierz informacje o potworze.",
    })
    .addStringOption((option) =>
      option
        .setName("monster")
        .setDescription("The name of the monster.")
        .setDescriptionLocalizations({
          "es-ES": "El nombre del monstruo.",
          "pt-BR": "O nome do monstro.",
          pl: "Nazwa potwora.",
        })
        .setRequired(true)
        .setAutocomplete(true)
    ),
  options: {
    clientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.AttachFiles],
    cooldown: 3,
    guilds: [],
    premium: false,
    ephemeral: false,
  },
  async run(interaction: ChatInputCommandInteraction<"cached">, args: InteractionArgs) {
    const monster = interaction.options.getString("monster") ?? "";
    const languageKey = args.language === SupportedLanguages.EN ? "name" : "language-" + args.language.toLowerCase();

    const filter = {
      includeScore: true,
      shouldSort: true,
      threshold: 0.8,
      keys: [languageKey],
    };

    const fuse = new Fuse(client.kakeleMonsters, filter);
    const result = fuse
      .search(monster)
      .filter((e) => typeof e.score === "number" && e.score <= monsterSearchThreshold)
      .slice(0, monsterSearchResultLimit) as Array<{ item: KakeleMonster }>;

    if (result.length === 0) {
      const noResultEmbed = new CustomEmbed()
        .setTitle(client.translate("PLAYER_SEARCH_BY_SIMILARITY_EMPTY_TITLE", args.language))
        .setDescription(client.translate("PLAYER_SEARCH_BY_SIMILARITY_EMPTY_DESCRIPTION", args.language))
        .setAuthor({ name: "Kakele Biridim", iconURL: client.icons.ElderVampireBrooch })
        .setColor(client.colors.DarkRed);

      return await interaction.editReply({ embeds: [noResultEmbed] });
    }

    if (result.length > 1) {
      const resultSelectionEmbed = new CustomEmbed()
        .setTitle(client.translate("PLAYER_SEARCH_RESULT_SELECTION_TITLE", args.language))
        .setDescription(client.translate("PLAYER_SEARCH_RESULT_SELECTION_DESCRIPTION", args.language))
        .setAuthor({ name: "Kakele Biridim", iconURL: client.icons.ElderVampireBrooch })
        .setColor(client.colors.LimeGreen);

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(MONSTER_RESULT_SELECTION_MENU(result, languageKey));

      await interaction.editReply({ embeds: [resultSelectionEmbed], components: [actionRow] }).then((message) => {
        const collector = message.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 30000,
        });

        collector.on("collect", async (i) => {
          if (i.user.id === interaction.user.id) {
            const index = i.values[0];

            await i.deferUpdate();

            const image = await createMonsterInfoImage(client, result[index].item, args.language);

            await interaction.editReply({
              files: [
                {
                  name: `${interaction.commandName}-${result[index].item.name as string}.png`,
                  attachment: image.toBuffer(),
                },
              ],
              embeds: [],
              components: [],
            });
          }
        });

        collector.on("end", (collected) => {
          if (collected.size === 0) {
            message.delete().catch(() => {});
          }
        });
      });
    } else {
      const image = await createMonsterInfoImage(client, result[0].item, args.language);

      await interaction.editReply({
        files: [
          {
            name: `${interaction.commandName}-${result[0].item.name}.png`,
            attachment: image.toBuffer(),
          },
        ],
        embeds: [],
        components: [],
      });
    }
  },
});
