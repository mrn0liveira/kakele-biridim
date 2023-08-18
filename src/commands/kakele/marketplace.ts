import {
  type ChatInputCommandInteraction,
  type ButtonBuilder,
  type MessageComponentInteraction,
  type TextInputModalData,
  type StringSelectMenuBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonStyle,
  AttachmentBuilder,
  type StringSelectMenuInteraction
} from 'discord.js'
import {
  MARKETPLACE_MAIN_ADD,
  MARKETPLACE_MAIN_MANAGE,
  MARKETPLACE_MAIN_RULES,
  MARKETPLACE_MAIN_EXIT,
  MARKETPLACE_ADD_BACK,
  MARKETPLACE_ADD_ITEM,
  MARKETPLACE_ADD_STATS,
  MARKETPLACE_ADD_PRICE,
  MARKETPLACE_ADD_SERVER,
  MARKETPLACE_ADD_STATS_MAGIC,
  MARKETPLACE_ADD_STATS_ATTACK,
  MARKETPLACE_ADD_STATS_ARMOR,
  MARKETPLACE_ADD_STATS_BLESS,
  MARKETPLACE_ADD_PRICE_COINS,
  MARKETPLACE_ADD_PRICE_GOLD,
  MARKETPLACE_ADD_PRICE_MONEY,
  MARKETPLACE_ADD_VALUE_MONEY_VALUE,
  MARKETPLACE_ADD_PRICE_CONFIRM,
  MARKETPLACE_VIEW_NEXT_PAGE,
  MARKETPLACE_VIEW_PREVIOUS_PAGE,
  MARKETPLACE_VIEW_HOME_PAGE,
  MARKETPLACE_VIEW_EXIT,
  MARKETPLACE_VIEW_FILTER,
  MARKETPLACE_VIEW_SELECT,
  MARKETPLACE_VIEW_HELP,
  MARKETPLACE_VIEW_SELECT_ITEM_CHAT,
  MARKETPLACE_VIEW_SELECT_ITEM_REPORT,
  MARKETPLACE_VIEW_BACK,
  MARKETPLACE_VIEW_FILTER_BY_SERVER,
  MARKETPLACE_VIEW_FILTER_BY_NAME,
  MARKETPLACE_VIEW_FILTER_BY_EQUIPMENT,
  MARKETPLACE_VIEW_FILTER_BY_PRICE
} from '../../components/discordButton/index.ts'
import {
  MARKETPLACE_ADD_ITEM_MODAL,
  MARKETPLACE_ADD_PRICE_MODAL,
  MARKETPLACE_ADD_STATS_MODAL
} from '../../components/discordModal/index.ts'
import {
  CURRENCY_SELECTION,
  MARKETPLACE_ADD_RESULT_SELECTION_MENU,
  MARKETPLACE_VIEW_SELECTION_MENU,
  GENERIC_SERVER_SELECTION
} from '../../components/discordMenu/index.ts'
import { type InteractionArgs } from '../../structures/misc.ts'
import { CustomEmbed, chunkArray, getLanguageName } from '../../misc/util/index.ts'
import InteractionCommand from '../../structures/command.ts'
import { client, logger } from '../../index.ts'
import Fuse from 'fuse.js'
import { createItemListImage } from '../../misc/canvas/index.ts'
import { getMarketList } from '../../misc/database/index.ts'
import { type IOfferItemDocument, MarketplaceItem } from '../../database/schemas/marketplace-item.ts'
import { type Canvas } from 'canvas'
import { type Types } from 'mongoose'

const mainMenuImage = new AttachmentBuilder('./src/assets/marketplace/000.png')

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName('marketplace')
    .setDescription('External storefront for the game Kakele, to display and purchase items.')
    .setDescriptionLocalizations({
      'es-ES': 'Tienda externa para el juego Kakele, para mostrar y comprar objetos.',
      'pt-BR': 'Loja externa para o jogo Kakele, para exibir e comprar itens.',
      pl: 'Zewnętrzny sklep dla gry Kakele, umożliwiający wyświetlanie i zakup przedmiotów.'
    })
    .addSubcommand(options => options
      .setName('manage')
      .setDescription('Manage your items on the biridim marketplace')
      .setDescriptionLocalizations({
        'es-ES': 'Administra tus objetos en el mercado de biridim',
        'pt-BR': 'Gerencie seus itens no marketplace do biridim',
        pl: 'Zarządzaj swoimi przedmiotami na rynku biridim'
      }))
    .addSubcommand(options => options
      .setName('view')
      .setDescription('Show the biridim marketplace with filtering and pagination functions.')
      .setDescriptionLocalizations({
        'es-ES': 'Mostrar el mercado de biridim con funciones de filtrado y paginación.',
        'pt-BR': 'Mostra o marketplace do biridim com funções de filtragem e paginação.',
        pl: 'Pokaż rynek biridim z funkcjami filtrowania i paginacji.'
      })),
  options: {
    clientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseExternalEmojis],
    cooldown: 10,
    guilds: ['902334195773353995'],
    premium: false,
    ephemeral: true
  },
  async run (interaction: ChatInputCommandInteraction<'cached'>, args: InteractionArgs) {
    const subcommand = interaction.options.getSubcommand()
    const language = getLanguageName(args.language.toString())

    async function manageMarketplace (): Promise<void> {
      await interaction.editReply({
        components:
        [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(MARKETPLACE_MAIN_ADD(client.translate('MARKETPLACE_MAIN_ADD', args.language)))
            .addComponents(MARKETPLACE_MAIN_MANAGE(client.translate('MARKETPLACE_MAIN_MANAGE', args.language)))
            .addComponents(MARKETPLACE_MAIN_RULES(client.translate('MARKETPLACE_MAIN_RULES', args.language)))
            .addComponents(MARKETPLACE_MAIN_EXIT(client.translate('MARKETPLACE_MAIN_EXIT', args.language)))
        ],
        files: [
          mainMenuImage
        ]
      }).then(message => {
        let item: { name: string, emoji: string, raw: any } = { name: '` `', emoji: '` `', raw: [] }
        let stats = { magic: 0, attack: 0, armor: 0, bless: 0 }
        let price = { gold: 0, coins: 0, money: { currency: '', amount: 0 } }

        let servers: string[] = []
        let amount: number = 0

        function getStatsString (): string {
          return `${
            stats.magic > 0
              ? `<:kakelemagic:1046162006278934568> ${stats.magic}`
              : ''
          } ${
            stats.attack > 0
              ? `<:kakeleattack:1046161996288106627>  ${stats.attack}`
              : ''
          } ${
            stats.armor > 0
              ? `<:kakelearmor:1046161994308407326>  ${stats.armor}`
              : ''
          } ${
            stats.bless > 0
              ? `<:kakelebless:1046161998397841439> ${stats.bless}`
              : ''
          }`
        }

        function getPriceString (): string {
          return `${
            price.gold > 0
              ? `\`${new Intl.NumberFormat().format(price.gold)}\` <:kakelegold:1046162004471193730>`
              : ''
          } ${
            price.coins > 0
              ? `\`${new Intl.NumberFormat().format(price.coins)}\` <:kakelecoins:1046162000339816618> `
              : ''
          } ${
            price.money.amount > 0
              ? `\`${new Intl.NumberFormat().format(price.money.amount)} ${price.money.currency}\` <:kakelemoney:1121149260482752628>`
              : ''
          } `
        }

        async function modalErr (err: Error): Promise<void> {
          if (err.name === 'Error [InteractionCollectorError]') {
            await interaction.followUp(
              {
                content: client.translate('MARKETPLACE_ERROR_MODAL_RESPONSE_TITLE', args.language),
                ephemeral: true
              }
            )
            return
          }
          logger.error(
            'modalErrCb',
            err
          )
        }

        async function createItemOffer (i: MessageComponentInteraction): Promise<void> {
          const now = new Date()

          await MarketplaceItem.create({
            owner: args.user._id,
            posted_date: now,
            expiration_date: now.setTime(now.getTime() + 604800000),
            amount,
            servers,
            item: {
              name: item.name,
              stats,
              price
            }
          })
            .then(async (res: IOfferItemDocument) => {
              logger.audit(`Item added by ${interaction.user.id} with ObjectId: ${res._id.toHexString()}`, `${item.name}`, JSON.stringify(stats), JSON.stringify(price), servers)

              await sendCreatedOfferMessage(i, res._id)

              item = { name: '` `', emoji: '` `', raw: [] }
              stats = { magic: 0, attack: 0, armor: 0, bless: 0 }
              price = { gold: 0, coins: 0, money: { currency: '', amount: 0 } }

              servers = []
              amount = 0

              await showMainAddRow(i)
            })
            .catch(err => {
              logger.error(
                'showSetGenericPriceModal',
                err
              )
            })
        }

        async function sendCreatedOfferMessage (i: MessageComponentInteraction, id: Types.ObjectId): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          const string = `- ${item.emoji} ${amount}x \`${item.name}\` ${getStatsString()} ${getPriceString()}`

          await i.followUp(
            {
              embeds:
              [
                new CustomEmbed()
                  .setDescription(client.translate('MARKETPLACE_ADD_CONFIRMATION_TITLE', args.language, { item: string }))
                  .setFooter({ text: `Code: ${id.toHexString()}` })
              ],
              ephemeral: true
            }
          )
        }

        async function showMainRow (i: MessageComponentInteraction): Promise<void> {
          await i.editReply({
            files: [
              mainMenuImage
            ],
            embeds: [],
            components:
            [
              new ActionRowBuilder<ButtonBuilder>()
                .addComponents(MARKETPLACE_MAIN_ADD(client.translate('MARKETPLACE_MAIN_ADD', args.language)))
                .addComponents(MARKETPLACE_MAIN_MANAGE(client.translate('MARKETPLACE_MAIN_MANAGE', args.language)))
                .addComponents(MARKETPLACE_MAIN_RULES(client.translate('MARKETPLACE_MAIN_RULES', args.language)))
                .addComponents(MARKETPLACE_MAIN_EXIT(client.translate('MARKETPLACE_MAIN_EXIT', args.language)))
            ]
          })
        }

        async function showMainAddRow (i: MessageComponentInteraction): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          const statsString = getStatsString()
          const priceString = getPriceString()

          await i.editReply({
            embeds:
            [
              new CustomEmbed()
                .setTitle(client.translate('MARKETPLACE_ADD_EMBED_TITLE', args.language))
                .setDescription(client.translate('MARKETPLACE_ADD_EMBED_DESCRIPTION', args.language, {
                  item: `${amount > 0 ? `${amount}x` : ''} ${item.emoji} ${item.name}`,
                  stats: statsString.length === 3 ? '` `' : statsString,
                  price: priceString.length === 2 ? '` `' : priceString
                }))
                .setFooter({ text: client.translate('MARKETPLACE_ADD_EMBED_FOOTER_MAIN', args.language) })
            ],
            components:
            [
              new ActionRowBuilder<ButtonBuilder>()
                .addComponents(MARKETPLACE_ADD_BACK(client.translate('MARKETPLACE_ADD_BACK', args.language)))
                .addComponents(MARKETPLACE_ADD_ITEM(client.translate('MARKETPLACE_ADD_ITEM_MODAL', args.language)))
                .addComponents(MARKETPLACE_ADD_STATS(client.translate('MARKETPLACE_ADD_STATS', args.language)).setDisabled(item.name === '` `' || !('stats' in item.raw)))
                .addComponents(MARKETPLACE_ADD_SERVER(client.translate('MARKETPLACE_ADD_SERVER', args.language)).setDisabled(item.name === '` `'))
                .addComponents(MARKETPLACE_ADD_PRICE(client.translate('MARKETPLACE_ADD_PRICE', args.language)).setDisabled(item.name === '` `' || servers.length === 0))
            ],
            files: []
          })
        }

        async function showItemResultSelectionRow (items: any[], i: MessageComponentInteraction): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          const statsString = getStatsString()
          const priceString = getPriceString()

          await i.editReply({
            embeds:
            [
              new CustomEmbed()
                .setTitle(client.translate('MARKETPLACE_ADD_EMBED_TITLE', args.language))
                .setDescription(client.translate('MARKETPLACE_ADD_EMBED_DESCRIPTION', args.language, {
                  item: `${amount > 0 ? `${amount}x` : ''} ${item.emoji} ${item.name}`,
                  stats: statsString.length === 3 ? '` `' : statsString,
                  price: priceString.length === 2 ? '` `' : priceString
                }))
                .setFooter({ text: client.translate('MARKETPLACE_ADD_EMBED_FOOTER_ITEM_SELECTION', args.language) })
            ],
            components:
            [
              new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(MARKETPLACE_ADD_RESULT_SELECTION_MENU(client, items, language)),
              new ActionRowBuilder<ButtonBuilder>()
                .addComponents(MARKETPLACE_ADD_BACK(client.translate('MARKETPLACE_ADD_BACK', args.language)).setCustomId('MARKETPLACE_ADD_BACK_GENERIC'))
            ]
          })
        }

        async function showSetCurrencyRow (i: MessageComponentInteraction): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          const statsString = getStatsString()
          const priceString = getPriceString()

          await i.editReply({
            embeds:
            [
              new CustomEmbed()
                .setTitle(client.translate('MARKETPLACE_ADD_EMBED_TITLE', args.language))
                .setDescription(client.translate('MARKETPLACE_ADD_EMBED_DESCRIPTION', args.language, {
                  item: `${amount > 0 ? `${amount}x` : ''} ${item.emoji} ${item.name}`,
                  stats: statsString.length === 3 ? '` `' : statsString,
                  price: priceString.length === 2 ? '` `' : priceString
                }))
                .setFooter({ text: client.translate('MARKETPLACE_ADD_EMBED_FOOTER_CURRENCY_SELECTION', args.language) })
            ],
            components:
            [
              new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(CURRENCY_SELECTION()),
              new ActionRowBuilder<ButtonBuilder>()
                .addComponents(MARKETPLACE_ADD_BACK(client.translate('MARKETPLACE_ADD_BACK', args.language)).setCustomId('MARKETPLACE_ADD_BACK_CURRENCY_SELECTION'))
                .addComponents(MARKETPLACE_ADD_VALUE_MONEY_VALUE(client.translate('MARKETPLACE_ADD_VALUE_MONEY_VALUE', args.language)))
            ]
          })
        }

        async function showItemPriceRow (i: MessageComponentInteraction): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          const statsString = getStatsString()
          const priceString = getPriceString()

          await i.editReply({
            embeds:
            [
              new CustomEmbed()
                .setTitle(client.translate('MARKETPLACE_ADD_EMBED_TITLE', args.language))
                .setDescription(client.translate('MARKETPLACE_ADD_EMBED_DESCRIPTION', args.language, {
                  item: `${amount > 0 ? `${amount}x` : ''} ${item.emoji} ${item.name}`,
                  stats: statsString.length === 3 ? '` `' : statsString,
                  price: priceString.length === 2 ? '` `' : priceString
                }))
                .setFooter({ text: client.translate('MARKETPLACE_ADD_EMBED_FOOTER_PRICE', args.language) })
            ],
            components:
            [
              new ActionRowBuilder<ButtonBuilder>()
                .addComponents(MARKETPLACE_ADD_BACK(client.translate('MARKETPLACE_ADD_BACK', args.language)).setCustomId('MARKETPLACE_ADD_PRICE_BACK'))
                .addComponents(MARKETPLACE_ADD_PRICE_COINS(client.translate('MARKETPLACE_ADD_PRICE_COINS', args.language)))
                .addComponents(MARKETPLACE_ADD_PRICE_GOLD(client.translate('MARKETPLACE_ADD_PRICE_GOLD', args.language)))
                .addComponents(MARKETPLACE_ADD_PRICE_MONEY(client.translate('MARKETPLACE_ADD_PRICE_MONEY', args.language)))
                .addComponents(MARKETPLACE_ADD_PRICE_CONFIRM(client.translate('MARKETPLACE_ADD_PRICE_CONFIRM', args.language))
                  .setDisabled(price.coins === 0 && price.gold === 0 && (price.money.amount === 0 || price.money.currency === '')))
            ]
          })
        }

        async function showItemSetStatsRow (i: MessageComponentInteraction): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }
          const statsString = getStatsString()
          const priceString = getPriceString()

          await i.editReply({
            embeds:
            [
              new CustomEmbed()
                .setTitle(client.translate('MARKETPLACE_ADD_EMBED_TITLE', args.language))
                .setDescription(client.translate('MARKETPLACE_ADD_EMBED_DESCRIPTION', args.language, {
                  item: `${amount > 0 ? `${amount}x` : ''} ${item.emoji} ${item.name}`,
                  stats: statsString.length === 3 ? '` `' : statsString,
                  price: priceString.length === 2 ? '` `' : priceString
                }))
                .setFooter({ text: client.translate('MARKETPLACE_ADD_EMBED_FOOTER_STATS', args.language) })
            ],
            components:
            [
              new ActionRowBuilder<ButtonBuilder>()
                .addComponents(MARKETPLACE_ADD_BACK(client.translate('MARKETPLACE_ADD_BACK', args.language)).setCustomId('MARKETPLACE_ADD_BACK_GENERIC').setStyle(ButtonStyle.Primary))
                .addComponents(MARKETPLACE_ADD_STATS_MAGIC(client.translate('MARKETPLACE_ADD_STATS_MAGIC', args.language))
                  .setDisabled(!('stats' in item.raw)))
                .addComponents(MARKETPLACE_ADD_STATS_ATTACK(client.translate('MARKETPLACE_ADD_STATS_ATTACK', args.language))
                  .setDisabled(!('stats' in item.raw)))
                .addComponents(MARKETPLACE_ADD_STATS_ARMOR(client.translate('MARKETPLACE_ADD_STATS_ARMOR', args.language))
                  .setDisabled(!('stats' in item.raw)))
                .addComponents(MARKETPLACE_ADD_STATS_BLESS(client.translate('MARKETPLACE_ADD_STATS_BLESS', args.language))
                  .setDisabled(!('stats' in item.raw)))
            ]
          })
        }

        async function showServerSelectionRow (i: MessageComponentInteraction): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          const statsString = getStatsString()
          const priceString = getPriceString()

          await i.editReply({
            embeds:
            [
              new CustomEmbed()
                .setTitle(client.translate('MARKETPLACE_ADD_EMBED_TITLE', args.language))
                .setDescription(client.translate('MARKETPLACE_ADD_EMBED_DESCRIPTION', args.language, {
                  item: `${amount > 0 ? `${amount}x` : ''} ${item.emoji} ${item.name}`,
                  stats: statsString.length === 3 ? '` `' : statsString,
                  price: priceString.length === 2 ? '` `' : priceString
                }))
                .setFooter({ text: client.translate('MARKETPLACE_ADD_EMBED_FOOTER_GENERIC_SERVER_SELECTION', args.language) })
            ],
            components:
            [
              new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(GENERIC_SERVER_SELECTION()
                  .setCustomId('MARKETPLACE_ADD_GENERIC_SERVER_SELECTION')
                  .addOptions({ label: 'Global', value: 'global' })
                  .setMaxValues(8)),
              new ActionRowBuilder<ButtonBuilder>()
                .addComponents(MARKETPLACE_ADD_BACK(client.translate('MARKETPLACE_ADD_BACK', args.language)).setCustomId('MARKETPLACE_ADD_BACK_GENERIC'))
            ]
          })
        }

        async function showSetCurrencyValueModal (i: MessageComponentInteraction): Promise<void> {
          await i.showModal(MARKETPLACE_ADD_PRICE_MODAL(client, args))

          await i.awaitModalSubmit({ time: 30 * 1000 })
            .then(async (modalResponse) => {
              await modalResponse.deferUpdate()

              const inputAmount = parseInt((modalResponse.components[0].components[0] as TextInputModalData).value)

              if (Number.isNaN(inputAmount) || inputAmount <= 0) {
                await i.followUp(
                  {
                    content: client.translate('MARKETPLACE_GENERIC_PRICE_VALUE_TITLE', args.language),
                    ephemeral: true
                  }
                )
                return
              }

              price.money.amount = inputAmount

              await showSetCurrencyRow(i)
            })
            .catch(err => { void modalErr(err) })
        }

        async function showItemSelectionModal (i: MessageComponentInteraction): Promise<void> {
          await i.showModal(MARKETPLACE_ADD_ITEM_MODAL(client, args))

          await i.awaitModalSubmit({ time: 30 * 1000 })
            .then(async (modalResponse) => {
              await modalResponse.deferUpdate()

              const inputItem = modalResponse.components[0].components[0] as TextInputModalData
              const inputAmount = parseInt((modalResponse.components[1].components[0] as TextInputModalData).value)

              amount = Number.isNaN(inputAmount) ? 1 : inputAmount

              const filter = {
                shouldSort: true,
                includeScore: true,
                threshold: 0.6,
                keys: [`name.${language}`]
              }

              const fuse = new Fuse(client.kakeleItems, filter)
              const result = fuse.search(inputItem.value).slice(0, 8).filter(x => (x.score ?? 0) <= 0.15)

              if (result.length > 0) {
                if (result.length === 1) {
                  const emoji = client.kakeleEmojis.find(x => x.name === result[0].item.name.english
                    .replace(/[^A-Z0-9]/ig, '')
                  )

                  item.raw = result[0].item

                  if (emoji != null) {
                    item.emoji = `<:${emoji.name}:${emoji.id}>`
                  }

                  item.name = result[0].item.name[language]
                  await showMainAddRow(i)
                  return
                }
                const items = result.map(x => x.item)

                await showItemResultSelectionRow(items.slice(0, 10), i)
              } else {
                await i.followUp(
                  {
                    content: client.translate('MARKETPLACE_UNKNOWN_RESULT_TITLE', args.language),
                    ephemeral: true
                  }
                )
              }
            })
            .catch(err => { void modalErr(err) })
        }

        async function showSetStatsModal (i: MessageComponentInteraction): Promise<void> {
          await i.showModal(MARKETPLACE_ADD_STATS_MODAL(client, args))

          await i.awaitModalSubmit({ time: 30 * 1000 })
            .then(async (modalResponse) => {
              await modalResponse.deferUpdate()

              const statType = i.customId.replace('MARKETPLACE_ADD_STATS_', '').toLocaleLowerCase()

              const inputAmount = parseInt((modalResponse.components[0].components[0] as TextInputModalData).value)

              async function handleStat (amount: number, max: number): Promise<void> {
                if (Number.isNaN(amount) || amount > max) {
                  await i.followUp(
                    {
                      content: client.translate('MARKETPLACE_UNKNOWN_STAT_VALUE_TITLE', args.language),
                      ephemeral: true
                    }
                  )
                  return
                }

                stats[statType] = amount
                await showItemSetStatsRow(i)
              }

              switch (statType) {
                case 'magic':
                case 'attack':
                case 'armor':
                  await handleStat(Math.floor(inputAmount / 5) * 5, 100)
                  break

                case 'bless':
                  await handleStat(inputAmount, 10)
                  break

                default:
                  await i.followUp(
                    {
                      content: client.translate('MARKETPLACE_UNKNOWN_STAT_TYPE_TITLE', args.language),
                      ephemeral: true
                    }
                  )
                  throw new Error('showSetStatsModal - Invalid item stat type')
              }
            })
            .catch(err => { void modalErr(err) })
        }

        async function showSetGenericPriceModal (i: MessageComponentInteraction): Promise<void> {
          await i.showModal(MARKETPLACE_ADD_PRICE_MODAL(client, args))

          await i.awaitModalSubmit({ time: 30 * 1000 })
            .then(async (modalResponse) => {
              await modalResponse.deferUpdate()

              const priceType = i.customId.replace('MARKETPLACE_ADD_PRICE_', '').toLocaleLowerCase()

              const inputAmount = parseInt((modalResponse.components[0].components[0] as TextInputModalData).value)

              if (Number.isNaN(inputAmount) || inputAmount <= 0) {
                await i.followUp(
                  {
                    content: client.translate('MARKETPLACE_UNKNOWN_GENERIC_PRICE_VALUE_TITLE', args.language),
                    ephemeral: true
                  }
                )
                return
              }

              price[priceType] = inputAmount

              await showItemPriceRow(i)
            })
            .catch(err => { void modalErr(err) })
        }

        async function handleResultSelection (i: StringSelectMenuInteraction): Promise<void> {
          if (!i.isStringSelectMenu()) return

          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          const options = i.component.options
          const value: string = i.values[0]

          const selectedOption = options.find((option) => option.label === value)

          if (selectedOption?.emoji !== undefined) {
            item.emoji = `<:${selectedOption.emoji?.name as string}:${selectedOption.emoji?.id as string}>`
          }

          item.raw = client.kakeleItems.find(x => x.name[language] === value)

          item.name = value

          await showMainAddRow(i)
        }

        async function handleServerSelection (i: StringSelectMenuInteraction): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          servers = i.values
          await showMainAddRow(i)
        }

        async function handleCurrencySelection (i: StringSelectMenuInteraction): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          price.money.currency = i.values[0]

          await showSetCurrencyRow(i)
        }

        async function handleBackPriceButton (i: MessageComponentInteraction): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          price = { gold: 0, coins: 0, money: { currency: '', amount: 0 } }

          await showMainAddRow(i)
        }

        async function handleBackButton (i: MessageComponentInteraction): Promise<void> {
          if (!i.deferred && !i.replied) {
            await i.deferUpdate()
          }

          item = { name: '` `', emoji: '` `', raw: [] }
          stats = { magic: 0, attack: 0, armor: 0, bless: 0 }
          price = { gold: 0, coins: 0, money: { currency: '', amount: 0 } }

          await showMainRow(i)
        }

        const interactionCollector = message.createMessageComponentCollector({ time: 90 * 1000 })

        interactionCollector.on('end', async (): Promise<void> => {
          interaction.deleteReply()
            .catch(() => {})
        })

        interactionCollector.on('collect', async (interactionResponse: MessageComponentInteraction<'cached'>): Promise<any> => {
          if (interactionResponse.user.id !== interaction.user.id) {
            await interactionResponse.deferUpdate()

            return await interactionResponse.followUp(
              {
                content: client.translate('MARKETPLACE_COLLECTOR_NOT_OWNER_TITLE', args.language),
                ephemeral: true
              }
            )
          }

          interactionCollector.resetTimer()

          switch (interactionResponse.customId) {
            case 'MARKETPLACE_MAIN_ADD':
              await showMainAddRow(interactionResponse)
              break

            case 'MARKETPLACE_ADD_BACK_CURRENCY_SELECTION':
              await showItemPriceRow(interactionResponse)
              break

            case 'MARKETPLACE_ADD_ITEM':
              await showItemSelectionModal(interactionResponse)
              break

            case 'MARKETPLACE_ADD_RESULT_SELECTION_MENU':
              await handleResultSelection(interactionResponse as StringSelectMenuInteraction)
              break

            case 'MARKETPLACE_ADD_STATS':
              await showItemSetStatsRow(interactionResponse)
              break

            case 'MARKETPLACE_ADD_BACK_GENERIC':
              await showMainAddRow(interactionResponse)
              break

            case 'MARKETPLACE_ADD_BACK':
              await handleBackButton(interactionResponse)
              break

            case 'MARKETPLACE_ADD_PRICE':
              await showItemPriceRow(interactionResponse)
              break

            case 'MARKETPLACE_ADD_SERVER':
              await showServerSelectionRow(interactionResponse)
              break

            case 'MARKETPLACE_ADD_GENERIC_SERVER_SELECTION':
              await handleServerSelection(interactionResponse as StringSelectMenuInteraction)
              break

            case 'MARKETPLACE_ADD_PRICE_MONEY':
              await showSetCurrencyRow(interactionResponse)
              break

            case 'MARKETPLACE_ADD_VALUE_MONEY_VALUE':
              await showSetCurrencyValueModal(interactionResponse)
              break

            case 'CURRENCY_SELECTION':
              await handleCurrencySelection(interactionResponse as StringSelectMenuInteraction)
              break

            case 'MARKETPLACE_ADD_PRICE_CONFIRM':
              await createItemOffer(interactionResponse)
              break

            case 'MARKETPLACE_ADD_PRICE_BACK':
              await handleBackPriceButton(interactionResponse)
              break

            case 'MARKETPLACE_ADD_PRICE_COINS':
            case 'MARKETPLACE_ADD_PRICE_GOLD':
              await showSetGenericPriceModal(interactionResponse)
              break

            case 'MARKETPLACE_ADD_STATS_MAGIC':
            case 'MARKETPLACE_ADD_STATS_ATTACK':
            case 'MARKETPLACE_ADD_STATS_ARMOR':
            case 'MARKETPLACE_ADD_STATS_BLESS':
              await showSetStatsModal(interactionResponse)
              break

            case 'MARKETPLACE_MAIN_EXIT':
              interactionCollector.stop()
              break

            default:
              break
          }
        })
      })
    }

    async function viewMarketplace (): Promise<void> {
      const entries = (await getMarketList({}))

      if (entries.length === 0) {
        await interaction.editReply(
          {
            embeds:
            [
              new CustomEmbed()
                .setTitle(client.translate('MARKETPLACE_VIEW_UNKNOWN_DATA_TITLE', args.language))
                .setDescription(client.translate('MARKETPLACE_VIEW_UNKNOWN_DATA_DESCRIPTION', args.language))
                .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                .setColor(client.colors.DarkRed)
            ]
          }
        )
        return
      }

      const cachedPages: Canvas[] = []
      let pageIndex: number = 0

      const pageEntries: IOfferItemDocument[][] = chunkArray(entries.sort((a, b) => {
        const dateA = new Date(a.posted_date).getTime()
        const dateB = new Date(b.posted_date).getTime()

        return dateA > dateB ? 1 : -1
      }), 15)

      let image: Canvas = await createItemListImage(pageEntries[pageIndex], `${pageIndex + 1}/${pageEntries.length}`)
      cachedPages.push(image)

      await interaction.editReply(
        {
          files:
          [
            {
              name: `${interaction.commandName}.png`,
              attachment: image.toBuffer()
            }
          ],
          components:
          [
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(MARKETPLACE_VIEW_EXIT(client.translate('MARKETPLACE_VIEW_EXIT', args.language)))
              .addComponents(MARKETPLACE_VIEW_HOME_PAGE())
              .addComponents(MARKETPLACE_VIEW_PREVIOUS_PAGE()
                .setDisabled(pageEntries[pageIndex - 1] === undefined))
              .addComponents(MARKETPLACE_VIEW_NEXT_PAGE()
                .setDisabled(pageEntries[pageIndex + 1] === undefined)),
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(MARKETPLACE_VIEW_FILTER(client.translate('MARKETPLACE_VIEW_FILTER', args.language)))
              .addComponents(MARKETPLACE_VIEW_SELECT(client.translate('MARKETPLACE_VIEW_SELECT', args.language)))
              .addComponents(MARKETPLACE_VIEW_HELP(client.translate('MARKETPLACE_VIEW_HELP', args.language)))
          ]
        }
      )
        .then(message => {
          function getStatsString ({ item }: IOfferItemDocument): string {
            return `${
              item.stats?.magic !== undefined && item.stats.magic > 0
                ? `<:kakelemagic:1046162006278934568> ${item.stats.magic}`
                : ''
            } ${
              item.stats?.attack !== undefined && item.stats.attack > 0
                ? `<:kakeleattack:1046161996288106627>  ${item.stats.attack}`
                : ''
            } ${
              item.stats?.armor !== undefined && item.stats.armor > 0
                ? `<:kakelearmor:1046161994308407326>  ${item.stats.armor}`
                : ''
            } ${
              item.stats?.bless !== undefined && item.stats.bless > 0
                ? `<:kakelebless:1046161998397841439> ${item.stats.bless}`
                : ''
            }`
          }

          function getPriceString ({ item }: IOfferItemDocument): string {
            return `${
              item.price.gold > 0
                ? `\`${new Intl.NumberFormat().format(item.price.gold)}\` <:kakelegold:1046162004471193730>`
                : ''
            } ${
              item.price.coins > 0
                ? `\`${new Intl.NumberFormat().format(item.price.coins)}\` <:kakelecoins:1046162000339816618> `
                : ''
            } ${
              item.price.money.amount > 0
                ? `\`${new Intl.NumberFormat().format(item.price.money.amount)} ${item.price.money.currency}\` <:kakelemoney:1121149260482752628>`
                : ''
            } `
          }

          async function showNextPage (i: MessageComponentInteraction): Promise<void> {
            pageIndex = pageEntries[pageIndex + 1] === undefined ? pageIndex : pageIndex + 1

            if (cachedPages[pageIndex] !== undefined) {
              image = cachedPages[pageIndex]
            } else {
              image = await createItemListImage(pageEntries[pageIndex], `${pageIndex + 1}/${pageEntries.length}`)
              cachedPages[pageIndex] = image
            }

            await showMainMenuRow(i, true)
          }

          async function showPreviosPage (i: MessageComponentInteraction): Promise<void> {
            pageIndex = pageEntries[pageIndex - 1] === undefined ? pageIndex : pageIndex - 1

            if (cachedPages[pageIndex] !== undefined) {
              image = cachedPages[pageIndex]
            } else {
              image = await createItemListImage(pageEntries[pageIndex], `${pageIndex + 1}/${pageEntries.length}`)
              cachedPages[pageIndex] = image
            }

            await showMainMenuRow(i, true)
          }

          async function showHomePage (i: MessageComponentInteraction): Promise<void> {
            pageIndex = 0
            image = cachedPages[pageIndex]

            await showMainMenuRow(i, true)
          }

          async function showMainMenuRow (i: MessageComponentInteraction, reloadImage: boolean): Promise<void> {
            if (!i.deferred && !i.replied) {
              await i.deferUpdate()
            }

            if (!reloadImage) {
              await interaction.editReply(
                {
                  components:
                  [
                    new ActionRowBuilder<ButtonBuilder>()
                      .addComponents(MARKETPLACE_VIEW_EXIT(client.translate('MARKETPLACE_VIEW_EXIT', args.language)))
                      .addComponents(MARKETPLACE_VIEW_HOME_PAGE())
                      .addComponents(MARKETPLACE_VIEW_PREVIOUS_PAGE()
                        .setDisabled(pageEntries[pageIndex - 1] === undefined))
                      .addComponents(MARKETPLACE_VIEW_NEXT_PAGE()
                        .setDisabled(pageEntries[pageIndex + 1] === undefined)),
                    new ActionRowBuilder<ButtonBuilder>()
                      .addComponents(MARKETPLACE_VIEW_FILTER(client.translate('MARKETPLACE_VIEW_FILTER', args.language)))
                      .addComponents(MARKETPLACE_VIEW_SELECT(client.translate('MARKETPLACE_VIEW_SELECT', args.language)))
                      .addComponents(MARKETPLACE_VIEW_HELP(client.translate('MARKETPLACE_VIEW_HELP', args.language)))
                  ]
                }
              )
              return
            }

            await interaction.editReply(
              {
                files:
                [
                  {
                    name: `${interaction.commandName}.png`,
                    attachment: image.toBuffer()
                  }
                ],
                components:
                [
                  new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(MARKETPLACE_VIEW_EXIT(client.translate('MARKETPLACE_VIEW_EXIT', args.language)))
                    .addComponents(MARKETPLACE_VIEW_HOME_PAGE())
                    .addComponents(MARKETPLACE_VIEW_PREVIOUS_PAGE()
                      .setDisabled(pageEntries[pageIndex - 1] === undefined))
                    .addComponents(MARKETPLACE_VIEW_NEXT_PAGE()
                      .setDisabled(pageEntries[pageIndex + 1] === undefined)),
                  new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(MARKETPLACE_VIEW_FILTER(client.translate('MARKETPLACE_VIEW_FILTER', args.language)))
                    .addComponents(MARKETPLACE_VIEW_SELECT(client.translate('MARKETPLACE_VIEW_SELECT', args.language)))
                    .addComponents(MARKETPLACE_VIEW_HELP(client.translate('MARKETPLACE_VIEW_HELP', args.language)))
                ]
              }
            )
          }

          async function showItemResultSelectionRow (i: MessageComponentInteraction): Promise<void> {
            if (!i.deferred && !i.replied) {
              await i.deferUpdate()
            }

            await interaction.editReply(
              {
                components:
                [
                  new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(MARKETPLACE_VIEW_SELECTION_MENU(pageEntries[pageIndex])),
                  new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(MARKETPLACE_VIEW_BACK(client.translate('MARKETPLACE_VIEW_BACK', args.language)))
                ]
              }
            )
          }

          async function showSelectedItemRow (i: StringSelectMenuInteraction): Promise<void> {
            if (!i.deferred && !i.replied) {
              await i.deferUpdate()
            }

            const item = entries.find(x => x._id.toHexString() === i.values[0])

            if (item === undefined) {
              await i.followUp(
                {
                  embeds:
                  [
                    new CustomEmbed()
                      .setTitle(client.translate('MARKETPLACE_VIEW_UNKNOWN_SELECTED_ITEM_TITLE', args.language))
                      .setDescription(client.translate('MARKETPLACE_VIEW_UNKNOWN_SELECTED_ITEM_DESCRIPTION', args.language))
                      .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                      .setColor(client.colors.DarkRed)
                  ],
                  ephemeral: true
                }
              )
              return
            }

            // if (item.owner?.id === interaction.user.id) {
            //   await i.followUp(
            //     {
            //       embeds:
            //       [
            //         new CustomEmbed()
            //           .setTitle(client.translate('MARKETPLACE_VIEW_OWNER_SELECTED_ITEM_TITLE', args.language))
            //           .setDescription(client.translate('MARKETPLACE_VIEW_OWNER_SELECTED_ITEM_DESCRIPTION', args.language))
            //           .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
            //           .setColor(client.colors.DarkRed)
            //       ],
            //       ephemeral: true
            //     }
            //   )
            //   return
            // }

            const string = `- ${client.getKakeleItemEmoji(item?.item.name)} ${item.amount}x \`${item.item.name}\` ${getStatsString(item)} ${getPriceString(item)}`

            await i.followUp(
              {
                embeds:
                [
                  new CustomEmbed()
                    .setDescription(client.translate('MARKETPLACE_VIEW_SELECTED_ITEM_TITLE', args.language, { item: string }))
                    .setFooter({ text: `Code: ${item._id.toHexString()}` })
                ],
                components:
                [
                  new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(MARKETPLACE_VIEW_SELECT_ITEM_CHAT(client.translate('MARKETPLACE_VIEW_SELECT_ITEM_CHAT', args.language)))
                    .addComponents(MARKETPLACE_VIEW_SELECT_ITEM_REPORT(client.translate('MARKETPLACE_VIEW_SELECT_ITEM_REPORT', args.language)))
                ],
                ephemeral: true
              }
            )
          }

          async function showFilterRow (i: MessageComponentInteraction): Promise<void> {
            if (!i.deferred && !i.replied) {
              await i.deferUpdate()
            }

            await interaction.editReply({
              components:
              [
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(MARKETPLACE_VIEW_BACK(client.translate('MARKETPLACE_VIEW_BACK', args.language)))
                  .addComponents(MARKETPLACE_VIEW_FILTER_BY_NAME(client.translate('MARKETPLACE_VIEW_FILTER_BY_NAME', args.language)))
                  .addComponents(MARKETPLACE_VIEW_FILTER_BY_SERVER(client.translate('MARKETPLACE_VIEW_FILTER_BY_SERVER', args.language)))
                  .addComponents(MARKETPLACE_VIEW_FILTER_BY_EQUIPMENT(client.translate('MARKETPLACE_VIEW_FILTER_BY_EQUIPMENT', args.language)))
                  .addComponents(MARKETPLACE_VIEW_FILTER_BY_PRICE(client.translate('MARKETPLACE_VIEW_FILTER_BY_PRICE', args.language)))
              ]
            })
          }

          const interactionCollector = message.createMessageComponentCollector({ time: 90 * 1000 })

          interactionCollector.on('end', async (): Promise<void> => {
            interaction.deleteReply()
              .catch(() => {})
          })

          interactionCollector.on('collect', async (interactionResponse: MessageComponentInteraction<'cached'>): Promise<any> => {
            if (interactionResponse.user.id !== interaction.user.id) {
              await interactionResponse.deferUpdate()

              return await interactionResponse.followUp(
                {
                  content: client.translate('MARKETPLACE_COLLECTOR_NOT_OWNER_TITLE', args.language),
                  ephemeral: true
                }
              )
            }

            interactionCollector.resetTimer()

            switch (interactionResponse.customId) {
              case 'MARKETPLACE_VIEW_NEXT_PAGE':
                await showNextPage(interactionResponse)
                break

              case 'MARKETPLACE_VIEW_PREVIOUS_PAGE':
                await showPreviosPage(interactionResponse)
                break

              case 'MARKETPLACE_VIEW_HOME_PAGE':
                await showHomePage(interactionResponse)
                break

              case 'MARKETPLACE_VIEW_SELECT':
                await showItemResultSelectionRow(interactionResponse)
                break

              case 'MARKETPLACE_VIEW_SELECTION_MENU':
                await showSelectedItemRow(interactionResponse as StringSelectMenuInteraction)
                break

              case 'MARKETPLACE_VIEW_BACK':
                await showMainMenuRow(interactionResponse, false)
                break

              case 'MARKETPLACE_VIEW_FILTER':
                await showFilterRow(interactionResponse)
                break

              case 'MARKETPLACE_VIEW_FILTER_BY_NAME':
                break

              case 'MARKETPLACE_VIEW_FILTER_BY_SERVER':
                break

              case 'MARKETPLACE_VIEW_FILTER_BY_EQUIPMENT':
                break

              case 'MARKETPLACE_VIEW_EXIT':
                interactionCollector.stop()
                break

              default:
                break
            }
          })
        })
    }

    switch (subcommand) {
      case 'manage':
        await manageMarketplace()
        break

      case 'view':
        await viewMarketplace()
        break

      default:
        break
    }
  }
})
