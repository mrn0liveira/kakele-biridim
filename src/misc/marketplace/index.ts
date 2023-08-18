import { codeBlock, type ButtonInteraction, type ModalSubmitInteraction, ActionRowBuilder, type ButtonBuilder } from 'discord.js'
import { MarketplaceItem } from '../../database/schemas/marketplace-item.ts'
import type Biridim from '../../structures/client.ts'
import { CustomEmbed, getMarketplaceStatsString } from '../util/index.ts'
import { type SupportedLanguages } from '../../structures/misc.ts'
import { MARKETPLACE_VIEW_ANSWER_MODAL, MARKETPLACE_VIEW_MESSAGE_MODAL, MARKETPLACE_VIEW_REPORT_MODAL } from '../../components/discordModal/index.ts'
import { MARKETPLACE_VIEW_DM_FINISH, MARKETPLACE_VIEW_DM_USER_ANSWER, MARKETPLACE_VIEW_DM_USER_REPORT } from '../../components/discordButton/index.ts'

/**
 * Retrieves the offer code from a string.
 * @param string - The input string containing the offer code.
 * @returns A regular expression match for the offer code.
 */
function getOfferCode (string): RegExpMatchArray {
  const regex = /^Code: ([0-9a-f]{24})(?:-([0-9a-f]{24}))?$/
  const match = string.match(regex)

  return match
}

/**
 * Handle the report cooldown and display the report modal to the user.
 * @param client - The Biridim client.
 * @param interaction - The button interaction.
 * @param language - The supported language.
 * @returns A promise that resolves to void.
 */
async function showReportItemModal (
  client: Biridim,
  interaction: ButtonInteraction,
  language: SupportedLanguages
): Promise<void> {
  const cooldown = client.handleInteractionCooldown(`ReportItem-${interaction.user.id}`, 300000)

  if (typeof cooldown === 'number') {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate()
    }

    await interaction.followUp({
      embeds: [
        new CustomEmbed()
          .setTitle(client.translate('MARKETPLACE_VIEW_REPORT_MODAL_SUBMIT_COOLDOWN_TITLE', language))
          .setDescription(client.translate('MARKETPLACE_VIEW_REPORT_MODAL_SUBMIT_COOLDOWN_DESCRIPTION', language, { time: Math.round(cooldown / 1000) }))
          .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
          .setColor(client.colors.DarkRed)
      ],
      ephemeral: true
    })
    return
  }

  await interaction.showModal(MARKETPLACE_VIEW_REPORT_MODAL(client, language))
}

/**
 * Display the message modal to send a message to the offer owner.
 * @param client - The Biridim client.
 * @param interaction - The button interaction.
 * @param language - The supported language.
 * @returns A promise that resolves to void.
 */
async function showMessageToOwnerModal (
  client: Biridim,
  interaction: ButtonInteraction,
  language: SupportedLanguages
): Promise<void> {
  const cooldown = client.handleInteractionCooldown(`MessageItemOwner-${interaction.user.id}`, 30000)

  if (typeof cooldown === 'number') {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate()
    }

    await interaction.followUp({
      embeds: [
        new CustomEmbed()
          .setTitle(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_COOLDOWN_TITLE', language))
          .setDescription(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_COOLDOWN_DESCRIPTION', language, { time: Math.round(cooldown / 1000) }))
          .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
          .setColor(client.colors.DarkRed)
      ],
      ephemeral: true
    })
    return
  }

  await interaction.showModal(MARKETPLACE_VIEW_MESSAGE_MODAL(client, language))
}

/**
 * Display the message modal to answer a message from the offer owner.
 * @param client - The Biridim client.
 * @param interaction - The button interaction.
 * @param language - The supported language.
 * @returns A promise that resolves to void.
 */
async function showMessageAnswerModal (
  client: Biridim,
  interaction: ButtonInteraction,
  language: SupportedLanguages
): Promise<void> {
  const cooldown = client.handleInteractionCooldown(`MessageItemOwner-${interaction.user.id}`, 30000)

  if (typeof cooldown === 'number') {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate()
    }

    await interaction.followUp({
      embeds: [
        new CustomEmbed()
          .setTitle(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_COOLDOWN_TITLE', language))
          .setDescription(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_COOLDOWN_DESCRIPTION', language, { time: Math.round(cooldown / 1000) }))
          .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
          .setColor(client.colors.DarkRed)
      ],
      ephemeral: true
    })
    return
  }

  await interaction.showModal(MARKETPLACE_VIEW_ANSWER_MODAL(client, language))
}

/**
 * Handle the submission of the report modal.
 * @param client - The Biridim client.
 * @param interaction - The modal submit interaction.
 * @param language - The supported language.
 * @returns A promise that resolves to void.
 */
async function handleReportItemSubmit (
  client: Biridim,
  interaction: ModalSubmitInteraction,
  language: SupportedLanguages
): Promise<void> {
  if (!interaction.deferred) {
    await interaction.deferUpdate()
  }

  const input = interaction.fields.getTextInputValue('input')
  const offerId = interaction.message?.embeds[0].footer?.text.replaceAll('Code: ', '')

  if (offerId === undefined) {
    await interaction.followUp({
      embeds: [
        new CustomEmbed()
          .setTitle(client.translate('MARKETPLACE_VIEW_REPORT_MODAL_SUBMIT_UNKNOWN_OFFERID_TITLE', language))
          .setDescription(client.translate('MARKETPLACE_VIEW_REPORT_MODAL_SUBMIT_UNKNOWN_OFFERID_DESCRIPTION', language))
          .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
          .setColor(client.colors.DarkRed)
      ],
      ephemeral: true
    })
    return
  }

  // Submit the report
  await interaction.followUp({
    embeds: [
      new CustomEmbed()
        .setTitle(client.translate('MARKETPLACE_VIEW_REPORT_MODAL_SUBMIT_TITLE', language))
        .setDescription(client.translate('MARKETPLACE_VIEW_REPORT_MODAL_SUBMIT_DESCRIPTION', language, { id: offerId, message: input }))
        .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
        .setColor(client.colors.LimeGreen)
    ],
    ephemeral: true
  })

  await client.marketReport.send({ content: `<:marketWarn:1128425456866164736> New Report from \`${interaction.user.id}(${interaction.guildId ?? 'DM'})\`\nCode: ${offerId}${codeBlock(input)}<@&902335947536998461>` })

  client.handleInteractionCooldown(`ReportItem-${interaction.user.id}`, 600000)
}

/**
 * Handle the submission of the message modal.
 * @param client - The Biridim client.
 * @param interaction - The modal submit interaction.
 * @param language - The supported language.
 * @returns A promise that resolves to void.
 */
async function handleMessageSubmit (
  client: Biridim,
  interaction: ModalSubmitInteraction,
  language: SupportedLanguages
): Promise<void> {
  if (!interaction.deferred) {
    await interaction.deferUpdate()
  }

  const input = interaction.fields.getTextInputValue('input')
  const offerId = getOfferCode(interaction.message?.embeds[0].footer?.text)

  if (offerId[1] === undefined || offerId[1].length === 0) {
    await interaction.followUp({
      embeds: [
        new CustomEmbed()
          .setTitle(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_UNKNOWN_OFFERID_TITLE', language))
          .setDescription(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_UNKNOWN_OFFERID_DESCRIPTION', language))
          .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
          .setColor(client.colors.DarkRed)
      ],
      ephemeral: true
    })
    return
  }

  const offer = await MarketplaceItem.findById(offerId[1])?.populate([{ path: 'owner' }])

  if (offer == null) {
    await interaction.followUp({
      embeds: [
        new CustomEmbed()
          .setTitle(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_TITLE', language))
          .setDescription(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_DESCRIPTION', language, { id: offerId, message: input }))
          .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
          .setColor(client.colors.LimeGreen)
      ],
      ephemeral: true
    })
    return
  }

  // Check if the original message was sent to the offer owner or from a buyer
  if (offerId[2] !== undefined && offerId[2].length > 0) {
    const index = offer.chats.findIndex((x) => x._id?.toHexString() === offerId[2])

    offer.chats[index].messages.push({
      author: 'Owner',
      content: input
    })

    await offer.save()

    const itemEmoji = client.getKakeleItemEmoji(offer.item.name)
    const statsString = getMarketplaceStatsString(offer)
    const string = `- ${itemEmoji} ${offer.amount}x \`${offer.item.name}\` ${statsString} ${statsString}`

    const messages = offer.chats[index].messages
      .map((x) => `${x.author === 'Buyer' ? `[2;36m${offer.chats[index].pseudonym}` : '[2;33mOwner'}: [2;37m${x.content}`)
      .slice(Math.max(offer.chats[index].messages.length - 10, 0))
      .join('\n')

    const chats = codeBlock('ansi', messages).slice(0, 2048)

    // Send a DM alert for the new message
    await client.sendMessageToUser(offer.chats[index].id, {
      content: `${client.getKakeleItemEmoji('marketChat')} ${client.translate('MARKETPLACE_VIEW_NEW_MESSAGE_', language)}`,
      embeds: [
        new CustomEmbed()
          .setDescription(client.translate('MARKETPLACE_VIEW_NEW_MESSAGE_TITLE', language, { item: string, message: chats }))
          .setAuthor({ name: 'Biridim Marketplace', iconURL: client.icons.ElderVampireBrooch })
          .setFooter({ text: `Code: ${offer._id.toHexString()}` })
          .setColor(client.colors.LimeGreen)
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(MARKETPLACE_VIEW_DM_USER_ANSWER(client.translate('MARKETPLACE_VIEW_DM_USER_ANSWER', language)))
          .addComponents(MARKETPLACE_VIEW_DM_FINISH(client.translate('MARKETPLACE_VIEW_DM_FINISH', language)))
          .addComponents(MARKETPLACE_VIEW_DM_USER_REPORT(client.translate('MARKETPLACE_VIEW_DM_USER_REPORT', language)))
      ]
    })

    // Send a confirmation that the message was sent
    await interaction.followUp({
      embeds: [
        new CustomEmbed()
          .setTitle(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_TITLE', language))
          .setDescription(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_DESCRIPTION', language, { id: offerId[1], message: input }))
          .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
          .setColor(client.colors.LimeGreen)
      ],
      ephemeral: true
    })
  } else {
    let index = offer.chats.findIndex((x) => x.id === interaction.user.id)

    // Generate a pseudonym for the buyer
    const shuffledMonsters = client.kakeleMonsters
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)

    if (index === -1) {
      const pseudonym = shuffledMonsters.find(
        (x) => offer.chats.findIndex((y) => y.pseudonym === x.name.english) === -1
      )?.name.english ?? interaction.user.id

      offer.chats.push({
        id: interaction.user.id,
        pseudonym,
        messages: [{ author: 'Buyer', content: input }]
      })

      index = offer.chats.length - 1
    } else {
      offer.chats[index].messages.push({ author: 'Buyer', content: input })
    }

    await offer.save()

    const itemEmoji = client.getKakeleItemEmoji(offer.item.name)
    const statsString = getMarketplaceStatsString(offer)
    const string = `- ${itemEmoji} ${offer.amount}x \`${offer.item.name}\` ${statsString} ${statsString}`

    const messages = offer.chats[index].messages
      .map((x) => `${x.author === 'Buyer' ? `[2;36m${offer.chats[index].pseudonym}` : '[2;33mOwner'}: [2;37m${x.content}`)
      .slice(Math.max(offer.chats[index].messages.length - 10, 0))
      .join('\n')

    const chats = codeBlock('ansi', messages).slice(0, 2048)

    // Send a DM alert for the new message
    await client.sendMessageToUser(offer.owner?.id as string, {
      content: `${client.getKakeleItemEmoji('marketChat')} ${client.translate('MARKETPLACE_VIEW_NEW_MESSAGE_', language)}`,
      embeds: [
        new CustomEmbed()
          .setDescription(client.translate('MARKETPLACE_VIEW_NEW_MESSAGE_TITLE', language, { item: string, message: chats }))
          .setAuthor({ name: 'Biridim Marketplace', iconURL: client.icons.ElderVampireBrooch })
          .setFooter({ text: `Code: ${offer._id.toHexString()}-${offer.chats[index]._id?.toHexString() ?? 'Unknown'}` })
          .setColor(client.colors.LimeGreen)
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(MARKETPLACE_VIEW_DM_USER_ANSWER(client.translate('MARKETPLACE_VIEW_DM_USER_ANSWER', language)))
          .addComponents(MARKETPLACE_VIEW_DM_USER_REPORT(client.translate('MARKETPLACE_VIEW_DM_USER_REPORT', language)))
      ]
    })

    // Send a confirmation that the message was sent
    await interaction.followUp({
      embeds: [
        new CustomEmbed()
          .setTitle(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_TITLE', language))
          .setDescription(client.translate('MARKETPLACE_VIEW_MESSAGE_MODAL_SUBMIT_DESCRIPTION', language, { id: offerId[1], message: input }))
          .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
          .setColor(client.colors.LimeGreen)
      ],
      ephemeral: true
    })
  }
}

export {
  showReportItemModal,
  showMessageToOwnerModal,
  showMessageAnswerModal,
  handleReportItemSubmit,
  handleMessageSubmit
}
