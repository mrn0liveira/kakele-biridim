import { type ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import InteractionCommand from '../../structures/command.ts'
import { getHealthRefinementCost, getManaRefinementCost } from '../../misc/util/index.ts'
import { createCanvas, type Canvas } from 'canvas'
import { cachedImages } from '../../misc/canvas/index.ts'

async function createRefineFoodImage (data: { value: number, mana: number, health: number }): Promise<Canvas> {
  const canvas = createCanvas(cachedImages.refineFood.width, cachedImages.refineFood.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(cachedImages.refineFood, 0, 0, canvas.width, canvas.height)

  ctx.font = '60pt HelveticaBold'

  ctx.fillStyle = '#4d99ed'
  ctx.fillText(Math.round(data.value / 200).toString(), 367, 185)

  ctx.fillStyle = '#e3aea3'
  ctx.fillText(Math.round(data.value / 400).toString(), 367, 485)

  ctx.fillStyle = '#f6ff75'
  ctx.fillText(new Intl.NumberFormat().format(data.mana * 100), 750, 185)
  ctx.fillText(new Intl.NumberFormat().format(data.health * 100), 750, 485)

  return canvas
}

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName('refine-food')
    .setDescription('Exibe os custos de aprimoramento dos alimentos de acordo com seu bônus.')
    .setDescriptionLocalizations({
      'es-ES': 'Muestra los costos de mejora de los alimentos según su bonificación.',
      'pt-BR': 'Exibe os custos de aprimoramento dos alimentos de acordo com seu bônus.',
      pl: 'Wyświetla koszty ulepszania jedzenia zgodnie z jego premią.'
    })
    .addIntegerOption(option => option
      .setName('value')
      .setDescription('O valor de aprimoramento a ser calculado')
      .setDescriptionLocalizations({
        'es-ES': 'El valor de mejora a calcular',
        'pt-BR': 'O valor de aprimoramento a ser calculado.',
        pl: 'Wartość ulepszenia do obliczenia.'
      })
      .setMinValue(200)
      .setMaxValue(10000)
      .setRequired(true)
    ),
  options: {
    clientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.AttachFiles],
    cooldown: 3,
    guilds: [],
    premium: false,
    ephemeral: false
  },
  async run (interaction: ChatInputCommandInteraction<'cached'>) {
    const value = interaction.options.getInteger('value') ?? 200

    const mana = getManaRefinementCost(value / 200)
    const health = getHealthRefinementCost(value / 400)

    const image: Canvas = await createRefineFoodImage({ value, mana, health })

    await interaction.editReply({
      files: [{
        name: `${interaction.commandName}-${value}.png`,
        attachment: image.toBuffer()
      }]
    })
  }
})
