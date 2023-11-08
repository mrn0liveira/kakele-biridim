import { type ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import InteractionCommand from '../../structures/command.ts'
import { type SupportedLanguages, type InteractionArgs } from '../../structures/misc.ts'
import { CustomEmbed, getExperienceToLevel } from '../../misc/util/index.ts'
import { client } from '../../index.ts'
import { createCanvas, type Canvas } from 'canvas'
import type Biridim from '../../structures/client.ts'
import { cachedImages, fillMixedText } from '../../misc/canvas/index.ts'

async function createExperienceImage (client: Biridim, initialLevel: number, finalLevel: number, language: SupportedLanguages): Promise<Canvas> {
  const canvas = createCanvas(cachedImages.experience.width, cachedImages.experience.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(cachedImages.experience, 0, 0, canvas.width, canvas.height)

  ctx.font = '40pt Oswald'
  ctx.fillStyle = '#dec549'
  ctx.globalAlpha = 0.8

  const experience = getExperienceToLevel(finalLevel) - getExperienceToLevel(initialLevel)

  fillMixedText(
    ctx,
    [
      {
        text: new Intl.NumberFormat().format(experience),
        fillStyle: '#fff1c9',
        font: '120pt Oswald'
      },
      {
        text: 'XP',
        fillStyle: '#ff9d8a',
        font: '40pt Oswald'
      }
    ],
    460, 395
  )

  fillMixedText(
    ctx,
    [
      {
        text: initialLevel,
        fillStyle: '#ff9d8a',
        font: '60pt Oswald'
      },
      {
        text: client.i18n.__({
          phrase: 'CREATE_EXPERIENCE_TEXT_BETWEEN',
          locale: language
        }),
        fillStyle: '#ffc9b3',
        font: '30pt Oswald'
      },
      {
        text: finalLevel,
        fillStyle: '#ff9d8a',
        font: '60pt Oswald'
      }
    ],
    460, 250
  )

  return canvas
}

async function createNegativeExperienceImage (client: Biridim, initialLevel: number, finalLevel: number, language: SupportedLanguages): Promise<Canvas> {
  const canvas = createCanvas(cachedImages.negativeExperience.width, cachedImages.negativeExperience.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(cachedImages.negativeExperience, 0, 0, canvas.width, canvas.height)

  ctx.font = '40pt Oswald'
  ctx.fillStyle = '#dec549'
  ctx.globalAlpha = 0.8

  const experience = getExperienceToLevel(finalLevel) - getExperienceToLevel(initialLevel)

  fillMixedText(
    ctx,
    [
      {
        text: new Intl.NumberFormat().format(experience),
        fillStyle: '#fff1c9',
        font: '120pt Oswald'
      },
      {
        text: 'XP',
        fillStyle: '#ff9d8a',
        font: '40pt Oswald'
      }
    ],
    460, 395
  )

  fillMixedText(
    ctx,
    [
      {
        text: initialLevel,
        fillStyle: '#ff9d8a',
        font: '60pt Oswald'
      },
      {
        text: client.i18n.__({ phrase: 'CREATE_EXPERIENCE_TEXT_BETWEEN', locale: language }),
        fillStyle: '#ffc9b3',
        font: '30pt Oswald'
      },
      {
        text: finalLevel,
        fillStyle: '#ff9d8a',
        font: '60pt Oswald'
      }
    ],
    460, 250
  )

  return canvas
}

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName('experience')
    .setDescription('Calculate the amount of XP necessary to reach from one level to another.')
    .setDescriptionLocalizations({
      'es-ES': 'Calcula la cantidad de XP necesaria para llegar de un nivel inicial a otro nivel final.',
      'pt-BR': 'Calcula a quantidade de XP necessária para chegar de um nível inicial a outro nível final.',
      pl: 'Oblicz ilość XP niezbędną do osiągnięcia kolejnego poziomu.'
    })
    .addIntegerOption(option => option
      .setName('initial-level')
      .setDescription('The initial level.')
      .setMinValue(20)
      .setMaxValue(2000)
      .setRequired(true)
      .setDescriptionLocalizations({
        'es-ES': 'El nivel inicial.',
        'pt-BR': 'O nível inicial.',
        pl: 'Poziom początkowy.'
      }))
    .addIntegerOption(option => option
      .setName('final-level')
      .setDescription('The final level.')
      .setMinValue(20)
      .setMaxValue(2000)
      .setRequired(true)
      .setDescriptionLocalizations({
        'es-ES': 'El nivel final.',
        'pt-BR': 'O nível final.',
        pl: 'Końcowy poziom.'
      })),
  options: {
    clientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.AttachFiles],
    cooldown: 3,
    guilds: [],
    premium: false,
    ephemeral: false
  },
  async run (interaction: ChatInputCommandInteraction<'cached'>, args: InteractionArgs) {
    const initialLevel = interaction.options.getInteger('initial-level') ?? 1
    const finalLevel = interaction.options.getInteger('final-level') ?? 1

    if (initialLevel == null || finalLevel == null) {
      return await interaction.editReply({
        embeds:
        [
          new CustomEmbed()
            .setTitle(client.translate('EXPERIENCE_NULL_INITIAL_FINAL_LEVEL', args.language))
            .setDescription(client.translate('EXPERIENCE_NULL_INITIAL_FINAL_LEVEL_DESCRIPTION', args.language))
            .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
            .setColor(client.colors.DarkRed)
        ]
      })
    }

    if (initialLevel === finalLevel) {
      return await interaction.editReply({
        embeds:
        [
          new CustomEmbed()
            .setTitle(client.translate('EXPERIENCE_EQUAL_INITIAL_FINAL_LEVEL', args.language))
            .setDescription(client.translate('EXPERIENCE_EQUAL_INITIAL_FINAL_LEVEL_DESCRIPTION', args.language))
            .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
            .setColor(client.colors.DarkRed)
        ]
      })
    }

    let image: Canvas

    if (finalLevel < initialLevel) {
      image = await createNegativeExperienceImage(client, initialLevel, finalLevel, args.language)
    } else {
      image = await createExperienceImage(client, initialLevel, finalLevel, args.language)
    }

    await interaction.editReply({
      files: [{
        name: `${interaction.commandName}-${initialLevel}-${finalLevel}.png`,
        attachment: image.toBuffer()
      }]
    })
  }
})
