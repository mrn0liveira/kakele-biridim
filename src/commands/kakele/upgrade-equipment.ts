import { type ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import InteractionCommand from '../../structures/command.ts'
import { type TextData, type EquipmentResourceData, type InteractionArgs, type SupportedLanguages } from '../../structures/misc.ts'
import { CustomEmbed, getEquipmentUpgradeResources } from '../../misc/util/index.ts'
import { client } from '../../index.ts'
import type Biridim from '../../structures/client.ts'
import { type Canvas, createCanvas } from 'canvas'
import { cachedImages } from '../../misc/canvas/index.ts'

async function createUpgradeEquipmentImage (client: Biridim, data: EquipmentResourceData, language: SupportedLanguages): Promise<Canvas> {
  const canvas = createCanvas(cachedImages.upgradeEquipment.width, cachedImages.upgradeEquipment.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(cachedImages.upgradeEquipment, 0, 0, canvas.width, canvas.height)

  const texts: TextData[] = [
    // text
    { text: client.i18n.__({ phrase: 'UPGRADE_EQUIPMENT_COPPER', locale: language }), x: 460 + (242 * 0), y: 333, fontSize: 12, font: 'HelveticaBold', color: '#6e2626', alpha: 0.8, textAlign: 'center' },
    { text: client.i18n.__({ phrase: 'UPGRADE_EQUIPMENT_TIN', locale: language }), x: 460 + (242 * 1), y: 333, fontSize: 12, font: 'HelveticaBold', color: '#6e2626', alpha: 0.8, textAlign: 'center' },
    { text: client.i18n.__({ phrase: 'UPGRADE_EQUIPMENT_SILVER', locale: language }), x: 460 + (242 * 2), y: 333, fontSize: 12, font: 'HelveticaBold', color: '#6e2626', alpha: 0.8, textAlign: 'center' },
    { text: client.i18n.__({ phrase: 'UPGRADE_EQUIPMENT_IRON', locale: language }), x: 460 + (242 * 3), y: 333, fontSize: 12, font: 'HelveticaBold', color: '#6e2626', alpha: 0.8, textAlign: 'center' },
    { text: client.i18n.__({ phrase: 'UPGRADE_EQUIPMENT_GOLD', locale: language }), x: 460 + (242 * 4), y: 333, fontSize: 12, font: 'HelveticaBold', color: '#6e2626', alpha: 0.8, textAlign: 'center' },
    // initial resource values
    { text: `${new Intl.NumberFormat().format(data.current?.copper ?? 0)}`, x: 460 + (242 * 0), y: 366, fontSize: 15, font: 'HelveticaBold', color: '#241e15', textAlign: 'center' },
    { text: `${new Intl.NumberFormat().format(data.current?.tin ?? 0)}`, x: 460 + (242 * 1), y: 366, fontSize: 15, font: 'HelveticaBold', color: '#241e15', textAlign: 'center' },
    { text: `${new Intl.NumberFormat().format(data.current?.silver ?? 0)}`, x: 460 + (242 * 2), y: 366, fontSize: 15, font: 'HelveticaBold', color: '#241e15', textAlign: 'center' },
    { text: `${new Intl.NumberFormat().format(data.current?.iron ?? 0)}`, x: 460 + (242 * 3), y: 366, fontSize: 15, font: 'HelveticaBold', color: '#241e15', textAlign: 'center' },
    { text: `${new Intl.NumberFormat().format(data.current?.gold ?? 0)}`, x: 460 + (242 * 4), y: 366, fontSize: 15, font: 'HelveticaBold', color: '#241e15', textAlign: 'center' },
    // total resource values
    { text: `${new Intl.NumberFormat().format(data.total?.copper ?? 0)}`, x: 460 + (242 * 0), y: 396, fontSize: 15, font: 'HelveticaBold', color: '#241e15', textAlign: 'center' },
    { text: `${new Intl.NumberFormat().format(data.total?.tin ?? 0)}`, x: 460 + (242 * 1), y: 396, fontSize: 15, font: 'HelveticaBold', color: '#241e15', textAlign: 'center' },
    { text: `${new Intl.NumberFormat().format(data.total?.silver ?? 0)}`, x: 460 + (242 * 2), y: 396, fontSize: 15, font: 'HelveticaBold', color: '#241e15', textAlign: 'center' },
    { text: `${new Intl.NumberFormat().format(data.total?.iron ?? 0)}`, x: 460 + (242 * 3), y: 396, fontSize: 15, font: 'HelveticaBold', color: '#241e15', textAlign: 'center' },
    { text: `${new Intl.NumberFormat().format(data.total?.gold ?? 0)}`, x: 460 + (242 * 4), y: 396, fontSize: 15, font: 'HelveticaBold', color: '#241e15', textAlign: 'center' },
    // cost values
    { text: `${Math.round(data.first / 5) * 5} ➔ ${Math.round(data.second / 5) * 5}`, x: 215, y: 200, fontSize: 40, font: 'Teko', color: '#6e2626', textAlign: 'center' },
    { text: client.i18n.__({ phrase: 'UPGRADE_EQUIPMENT_CURRENT_COST', locale: language }), x: 165, y: 340, fontSize: 12, font: 'Teko', color: '#241e15', textAlign: 'start' },
    { text: client.i18n.__({ phrase: 'UPGRADE_EQUIPMENT_TOTAL_COST', locale: language }), x: 165, y: 360, fontSize: 12, font: 'Teko', color: '#241e15', textAlign: 'start' },
    { text: new Intl.NumberFormat().format(data.current?.money ?? 0), x: 165, y: 220, fontSize: 12, font: 'Teko', color: '#241e15', textAlign: 'start' },
    { text: new Intl.NumberFormat().format(data.total?.money ?? 0), x: 165, y: 240, fontSize: 12, font: 'Teko', color: '#241e15', textAlign: 'start' }
  ]

  texts.forEach(({ text, x, y, fontSize, font, color, alpha = 1, textAlign = 'start' }) => {
    ctx.textAlign = textAlign
    ctx.font = `${fontSize}pt ${font}`
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    ctx.fillText(text, x, y)
  })

  return canvas
}

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName('upgrade-equipment')
    .setDescription('Calculate the amount of resources necessary to upgrade equipment.')
    .setDescriptionLocalizations({
      'es-ES': 'Calculate la cantidad de recursos necesarios para mejorar el equipo.',
      'pt-BR': 'Calcule a quantidade de recursos necessários para melhorar o equipamento.',
      pl: 'Oblicz ilość niezbędnych zasobów do ulepszenia sprzętu.'
    })
    .addIntegerOption(option => option
      .setName('initial-number')
      .setDescription('The initial number.')
      .setDescriptionLocalizations({
        'es-ES': 'El número inicial.',
        'pt-BR': 'O número inicial.',
        pl: 'Początkowa liczba.'
      })
      .setMinValue(5)
      .setMaxValue(100)
      .setRequired(true)
    )
    .addIntegerOption(option => option
      .setName('final-number')
      .setDescription('The final number.')
      .setDescriptionLocalizations({
        'es-ES': 'El número final.',
        'pt-BR': 'O número final.',
        pl: 'Końcowa liczba.'
      })
      .setMinValue(5)
      .setMaxValue(100)
    ),

  options: {
    clientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.AttachFiles],
    cooldown: 3,
    guilds: [],
    premium: false,
    ephemeral: false
  },
  async run (interaction: ChatInputCommandInteraction<'cached'>, args: InteractionArgs) {
    const start = interaction.options.getInteger('initial-number') ?? 0
    const end = interaction.options.getInteger('final-number')

    const data: EquipmentResourceData = {
      first: end == null ? 0 : start,
      second: end == null ? start : end
    }

    if (Math.round(data.first / 5) >= Math.round(data.second / 5)) {
      return await interaction.editReply({
        embeds:
        [
          new CustomEmbed()
            .setTitle(client.translate('UPGRADE_EQUIPMENT_EQUAL_VALUES', args.language))
            .setDescription(client.translate('UPGRADE_EQUIPMENT_EQUAL_VALUES_DESCRIPTION', args.language))
            .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
            .setColor(client.colors.DarkRed)
        ]
      })
    }

    data.total = getEquipmentUpgradeResources(0)

    for (let index = Math.round(data.first / 5); index < Math.round(data.second / 5); index += 1) {
      const resources = getEquipmentUpgradeResources(index + 1)

      data.total.copper += resources.copper
      data.total.tin += resources.tin
      data.total.silver += resources.silver
      data.total.iron += resources.iron
      data.total.gold += resources.gold
      data.total.money += resources.money
    }

    data.current = getEquipmentUpgradeResources(Math.round(data.first + 5 / 5))

    const image = await createUpgradeEquipmentImage(client, data, args.language)

    await interaction.editReply({
      files: [{
        name: `${interaction.commandName}-${data.first}>${data.second}.png`,
        attachment: image.toBuffer()
      }]
    })
  }
})
