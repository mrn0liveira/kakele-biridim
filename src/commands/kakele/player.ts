import { type ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, type StringSelectMenuBuilder, ComponentType } from 'discord.js'
import InteractionCommand from '../../structures/command.ts'
import { type SupportedLanguages, type CharacterData, type InteractionArgs, type TextData } from '../../structures/misc.ts'
import Fuse from 'fuse.js'
import { CustomEmbed, capitalizeFirstLetter, getExperienceToNextLevel, getLevel } from '../../misc/util/index.ts'
import { client } from '../../index.ts'
import { PLAYER_RESULT_SELECTION_MENU } from '../../components/discordMenu/index.ts'
import { cachedImages } from '../../misc/canvas/index.ts'
import { type Canvas, createCanvas, loadImage } from 'canvas'
import fs from 'fs'
import type Biridim from '../../structures/client.ts'

const playerSearchThreshold = 0.2
const playerSearchResultLimit = 6

async function createPlayerInfoImage (client: Biridim, player: CharacterData, language: SupportedLanguages): Promise<Canvas> {
  const canvas = createCanvas(cachedImages.playerInfo.width, cachedImages.playerInfo.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(cachedImages.playerInfo, 0, 0, canvas.width, canvas.height)

  const weeklyPlayerData: CharacterData = global.weeklyPlayerData?.find(x => x.name === player.name)

  const texts: TextData[] = [
    // text
    { text: client.translate(`PLAYER_VOCATION_${player.vocation}`, language), x: 600, y: 115, fontSize: 40, font: 'Vampire', color: '#420701', alpha: 0.8 },
    { text: player.name, x: 600, y: 220, fontSize: 130, font: 'Vampire', color: '#420701', alpha: 0.7 },
    { text: 'Level', x: 640, y: 265, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'Login', x: 640, y: 305, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'Pet', x: 640, y: 345, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'Attack', x: 640, y: 415, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'Magic', x: 640, y: 455, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'Armor', x: 640, y: 495, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'Gold', x: 1000, y: 265, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'Achievements', x: 1000, y: 305, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'Server', x: 1000, y: 345, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'Experience', x: 1000, y: 415, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'Daily Progress', x: 1000, y: 455, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    { text: 'XP per Level', x: 1000, y: 495, fontSize: 25, font: 'HelveticaBold', color: '#1f0f0c' },
    // player data
    { text: String(getLevel(Number(player.experience))), x: 640 + 120, y: 265, fontSize: 25, font: 'Helvetica', color: '#331a00' },
    { text: player.login_points, x: 640 + 120, y: 305, fontSize: 25, font: 'Helvetica', color: '#331a00' },
    { text: player.pet_points, x: 640 + 120, y: 345, fontSize: 25, font: 'Helvetica', color: '#331a00' },
    { text: new Intl.NumberFormat().format(Number(player.total_attack)), x: 640 + 120, y: 415, fontSize: 25, font: 'Helvetica', color: '#331a00' },
    { text: new Intl.NumberFormat().format(Number(player.total_magic)), x: 640 + 120, y: 455, fontSize: 25, font: 'Helvetica', color: '#331a00' },
    { text: new Intl.NumberFormat().format(Number(player.total_armor)), x: 640 + 120, y: 495, fontSize: 25, font: 'Helvetica', color: '#331a00' },
    { text: new Intl.NumberFormat().format(Number(player.gold)), x: 1000 + 270, y: 265, fontSize: 25, font: 'Helvetica', color: '#331a00' },
    { text: new Intl.NumberFormat().format(Number(player.achievements)), x: 1000 + 270, y: 305, fontSize: 25, font: 'Helvetica', color: '#331a00' },
    { text: capitalizeFirstLetter(player.server ?? ''), x: 1000 + 270, y: 345, fontSize: 25, font: 'Helvetica', color: '#331a00' },
    { text: new Intl.NumberFormat().format(Number(player.experience)), x: 1000 + 270, y: 415, fontSize: 25, font: 'Helvetica', color: '#331a00' },
    { text: new Intl.NumberFormat().format(Number(weeklyPlayerData?.progress ?? 0)), x: 1000 + 270, y: 455, fontSize: 25, font: 'Helvetica', color: '#000' },
    { text: new Intl.NumberFormat().format(getExperienceToNextLevel(getLevel(Number(player.experience)))), x: 1000 + 270, y: 495, fontSize: 25, font: 'Helvetica', color: '#331a00' }
  ]

  texts.forEach(({ text, x, y, fontSize, font, color, alpha = 1 }) => {
    ctx.font = `${fontSize}pt ${font}`
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    ctx.fillText(text, x, y)
  })

  const random = Math.floor(Math.random() * 8) + 1
  ctx.drawImage(await loadImage(`./src/assets/player/vocation/${player.vocation.toLowerCase()}/${random}.png`), 90, 0, 512, 512)

  if (fs.existsSync(`./src/assets/player/guilds/${player.guild}-${player.server ?? ''}.png`)) {
    const avatar = await loadImage(`./src/assets/player/guilds/${player.guild}-${player.server ?? ''}.png`)
    ctx.drawImage(avatar, 1525, 225, 80, 80)
  } else {
    const avatar = await loadImage('./src/assets/player/guilds/default.png')
    ctx.drawImage(avatar, 1525, 225, 80, 80)
  }

  return canvas
}

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName('player')
    .setDescription('Get information about a player.')
    .setDescriptionLocalizations({
      'es-ES': 'Obtener información sobre un jugador.',
      'pt-BR': 'Obter informaçãp sobre um jogador.',
      pl: 'Pobierz informacje o graczu.'
    })
    .addSubcommand((subcommand) =>
      subcommand
        .setName('info')
        .setDescription('Get information about a player.')
        .setDescriptionLocalizations({
          'es-ES': 'Obtener información sobre un jugador.',
          'pt-BR': 'Obter informaçãp sobre um jogador.',
          pl: 'Pobierz informacje o graczu.'
        })
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('The name of the player.')
            .setDescriptionLocalizations({
              'es-ES': 'El nombre del jugador.',
              'pt-BR': 'O nome do jogador.',
              pl: 'Nazwa gracza.'
            })
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),
  options: {
    clientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.AttachFiles],
    cooldown: 3,
    guilds: [],
    premium: false,
    ephemeral: false
  },
  async run (interaction: ChatInputCommandInteraction<'cached'>, args: InteractionArgs) {
    const playerInput = interaction.options.getString('name') ?? ''

    const filter = {
      includeScore: true,
      shouldSort: true,
      threshold: 0.8,
      keys: ['name']
    }

    const fuse = new Fuse(global.todayPlayerData, filter)
    const result = fuse
      .search(playerInput)
      .filter((e) => typeof e.score === 'number' && e.score <= playerSearchThreshold)
      .slice(0, playerSearchResultLimit) as Array<{ item: CharacterData }>

    if (result.length === 0) {
      const noResultEmbed = new CustomEmbed()
        .setTitle(client.translate('PLAYER_SEARCH_BY_SIMILARITY_EMPTY_TITLE', args.language))
        .setDescription(client.translate('PLAYER_SEARCH_BY_SIMILARITY_EMPTY_DESCRIPTION', args.language))
        .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
        .setColor(client.colors.DarkRed)

      return await interaction.editReply({ embeds: [noResultEmbed] })
    }

    if (result.length > 1) {
      const resultSelectionEmbed = new CustomEmbed()
        .setTitle(client.translate('PLAYER_SEARCH_RESULT_SELECTION_TITLE', args.language))
        .setDescription(client.translate('PLAYER_SEARCH_RESULT_SELECTION_DESCRIPTION', args.language))
        .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
        .setColor(client.colors.LimeGreen)

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(PLAYER_RESULT_SELECTION_MENU(result))

      await interaction.editReply({ embeds: [resultSelectionEmbed], components: [actionRow] })
        .then((message) => {
          const collector = message.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 30000
          })

          collector.on('collect', async (i) => {
            if (i.user.id === interaction.user.id) {
              const index = i.values[0]

              await i.deferUpdate()

              const image = await createPlayerInfoImage(client, result[index].item, args.language)

              await interaction.editReply({
                files: [
                  {
                    name: `${interaction.commandName}-${result[index].item.name as string}.png`,
                    attachment: image.toBuffer()
                  }
                ],
                embeds: [],
                components: []
              })
            }
          })

          collector.on('end', (collected) => {
            if (collected.size === 0) {
              message.delete().catch(() => {})
            }
          })
        })
    } else {
      const image = await createPlayerInfoImage(client, result[0].item, args.language)

      await interaction.editReply({
        files: [
          {
            name: `${interaction.commandName}-${result[0].item.name}.png`,
            attachment: image.toBuffer()
          }
        ],
        embeds: [],
        components: []
      })
    }
  }
})
