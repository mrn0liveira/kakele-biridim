import { type ChatInputCommandInteraction, inlineCode, PermissionFlagsBits } from 'discord.js'
import InteractionCommand from '../../structures/command.ts'

export default new InteractionCommand({
  data: {
    name: 'ping',
    description: 'Pong!'
  },
  options: {
    clientPermissions: [PermissionFlagsBits.SendMessages],
    cooldown: 5,
    guilds: [],
    premium: false,
    ephemeral: true
  },
  async run (interaction: ChatInputCommandInteraction<'cached'>) {
    const msg = await interaction.editReply({
      content: 'Pinging...'
    })
    setTimeout(() => {
      const ping = msg.createdTimestamp - interaction.createdTimestamp
      void interaction.editReply({
        content: `Pong! Latency is ${inlineCode(`${ping}ms`)}. \nAPI Latency is ${inlineCode(`${interaction.client.ws.ping}ms`)}`
      })
    }, 3000)
  }
})
