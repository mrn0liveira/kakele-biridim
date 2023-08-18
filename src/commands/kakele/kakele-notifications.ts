import {
  type ChatInputCommandInteraction,
  type ButtonBuilder,
  type MessageComponentInteraction,
  type ChannelSelectMenuBuilder,
  type ChannelSelectMenuInteraction,
  type RoleSelectMenuBuilder,
  type StringSelectMenuBuilder,
  type RoleSelectMenuInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuInteraction
} from 'discord.js'
import { type GuildInteractionArgs } from '../../structures/misc.ts'
import InteractionCommand from '../../structures/command.ts'
import { client, logger } from '../../index.ts'
import { CustomEmbed } from '../../misc/util/index.ts'
import {
  NOTIFICATION_BUTTON_EVENT_CONFIRM,
  NOTIFICATION_BUTTON_EVENT_ADD_ID,
  NOTIFICATION_BUTTON_EVENT_GENERIC_SERVER_SELECTION,
  NOTIFICATION_BUTTON_EVENT_BACK,
  NOTIFICATION_BUTTON_EVENT_CLEAR_CHANNEL,
  NOTIFICATION_BUTTON_EVENT_CLEAR_GUILD,
  NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX,
  NOTIFICATION_BUTTON_EVENT_CLEAR_ROLE,
  NOTIFICATION_BUTTON_EVENT_ROLE_SET_EVERYONE,
  NOTIFICATION_BUTTON_EVENT_SETTINGS_BACK,
  NOTIFICATION_BUTTON_EVENT_SETTINGS_CLEAR_EVERYONE,
  NOTIFICATION_BUTTON_MAINMENU_ADD,
  NOTIFICATION_BUTTON_MAINMENU_EXIT,
  NOTIFICATION_BUTTON_MAINMENU_SETTINGS,
  NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX_ADD
} from '../../components/discordButton/index.ts'
import {
  NOTIFICATION_MENU_BOOST_SELECTION,
  NOTIFICATION_MENU_EVENT_CHANNEL_SELECTION,
  NOTIFICATION_MENU_EVENT_ROLE_SELECTION,
  NOTIFICATION_MENU_EVENT_SETTINGS_CHANNEL_SELECTION,
  NOTIFICATION_MENU_EVENT_SETTINGS_ROLE_SELECTION,
  GENERIC_SERVER_SELECTION
} from '../../components/discordMenu/index.ts'
import { Guild } from '../../database/schemas/guild.ts'
import { NOTIFICATION_MODAL_EVENT_INDEX_SELECTION } from '../../components/discordModal/index.ts'

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName('kakele-notifications')
    .setDescription('Set up automatic notifications for Kakele boosts and events.')
    .setDescriptionLocalizations({
      'es-ES': 'Configura notificaciones automáticas para aumentos y eventos de Kakele.',
      'pt-BR': 'Configure notificações automáticas para boosts e eventos do Kakele.',
      pl: 'Skonfiguruj automatyczne powiadomienia o zwiększeniach i wydarzeniach w Kakele.'
    })
    .addSubcommand((subcommand) =>
      subcommand.setName('events').setDescription('Set up automatic notifications for Kakele events.').setDescriptionLocalizations({
        'es-ES': 'Configura notificaciones automáticas para eventos de Kakele.',
        'pt-BR': 'Configure notificações automáticas para eventos do Kakele.',
        pl: 'Skonfiguruj automatyczne powiadomienia o wydarzeniach w Kakele.'
      })
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('boosts').setDescription('Set up automatic notifications for Kakele boosts.').setDescriptionLocalizations({
        'es-ES': 'Configura notificaciones automáticas para aumentos de Kakele.',
        'pt-BR': 'Configure notificações automáticas para boosts do Kakele.',
        pl: 'Skonfiguruj automatyczne powiadomienia o zwiększeniach w Kakele.'
      })
    )
    .setDMPermission(false),
  options: {
    clientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.AttachFiles],
    cooldown: 5,
    guilds: [],
    premium: true,
    ephemeral: false
  },
  async run (interaction: ChatInputCommandInteraction<'cached'>, args: GuildInteractionArgs) {
    const subcommand = interaction.options.getSubcommand()

    let lastInteraction

    async function eventNotifiction (): Promise<void> {
      await interaction
        .editReply({
          content: '',
          embeds: [
            new CustomEmbed()
              .setTitle(client.translate('COMMAND_EVENT_ALERT_MAIN_ROW_TITLE', args.language))
              .setDescription(client.translate('COMMAND_EVENT_ALERT_MAIN_ROW_DESCRIPTION', args.language))
              .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
              .setColor(client.colors.Indigo)
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(NOTIFICATION_BUTTON_MAINMENU_ADD(client.translate('NOTIFICATION_BUTTON_MAINMENU_ADD', args.language)))
              .addComponents(NOTIFICATION_BUTTON_MAINMENU_SETTINGS(client.translate('NOTIFICATION_BUTTON_MAINMENU_SETTINGS', args.language)))
              .addComponents(NOTIFICATION_BUTTON_MAINMENU_EXIT(client.translate('NOTIFICATION_BUTTON_MAINMENU_EXIT', args.language)))
          ]
        })
        .then((message) => {
          let channels
          let server = ' '

          let roles: string[] = []
          let eventIDs: number[] = []

          const interactionCollector = message.createMessageComponentCollector({
            time: 90000
          })

          function convertStringToArray (string: string): any[] {
            const result: any[] = []

            const items = string.replaceAll('[^a-z]', '').replace(/^\s+/g, '').split(',')

            for (let i = 0; i < items.length; i += 1) {
              if (items[i].includes('-')) {
                const range = items[i].split('-')
                const start = parseInt(range[0], 10)
                const end = parseInt(range[1], 10)
                const innerArr: any[] = []

                for (let j = start; j <= end; j += 1) {
                  innerArr.push(j)
                }
                result.push(innerArr)
              } else {
                result.push([parseInt(items[i], 10)])
              }
            }
            return result.slice(0, 50)
          }

          function convertToRangeString (numbers: any[]): string {
            numbers.sort((a, b) => a - b)

            let result = ''

            let start: number = Number(numbers[0])
            let end: number = Number(numbers[0])

            if (Number.isNaN(start) && Number.isNaN(end)) {
              return ' '
            }

            for (let i = 1; i < numbers.length; i += 1) {
              if (numbers[i] === end + 1) {
                end = numbers[i]
              } else {
                if (start === end) {
                  result += `${start},`
                } else {
                  result += `${start}..${end},`
                }
                start = numbers[i]
                end = numbers[i]
              }
            }
            if (start === end) {
              result += String(start)
            } else {
              result += `${start}..${end}`
            }

            if (result === 'undefined') {
              return ' '
            }

            return result
          }

          function convertArrayToString (arr: any[]): string {
            let result = ''

            let start: number = Number(arr[0])
            let end: number = Number(arr[0])

            if (Number.isNaN(start) && Number.isNaN(end)) {
              return ' '
            }

            for (let i = 1; i < arr.length; i += 1) {
              if (arr[i] === end + 1) {
                end = arr[i]
              } else {
                result += start === end ? `${start},` : `${start}..${end},`
                start = end = arr[i]
              }
            }
            result += start === end ? `${start}` : `${start}..${end}`

            return result
          }

          function formatRoles (arr: string[]): string[] {
            return arr.map((x) => (x === 'everyone' ? '@everyone' : `<@&${x}>`))
          }

          async function showSettingsRow (res?: MessageComponentInteraction): Promise<void> {
            await res?.deferUpdate()

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_EVENT_ALERT_SETTINGS_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_EVENT_ALERT_SETTINGS_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_CLEAR_CHANNEL(client.translate('NOTIFICATION_BUTTON_EVENT_CLEAR_CHANNEL', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_CLEAR_ROLE(client.translate('NOTIFICATION_BUTTON_EVENT_CLEAR_ROLE', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX(client.translate('NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_CLEAR_GUILD(client.translate('NOTIFICATION_BUTTON_EVENT_CLEAR_GUILD', args.language)))
              ]
            })
          }

          async function showMainMenuRow (res?: MessageComponentInteraction): Promise<void> {
            eventIDs = []

            await res?.deferUpdate()

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_EVENT_ALERT_MAIN_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_EVENT_ALERT_MAIN_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(NOTIFICATION_BUTTON_MAINMENU_ADD(client.translate('NOTIFICATION_BUTTON_MAINMENU_ADD', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_MAINMENU_SETTINGS(client.translate('NOTIFICATION_BUTTON_MAINMENU_SETTINGS', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_MAINMENU_EXIT(client.translate('NOTIFICATION_BUTTON_MAINMENU_EXIT', args.language)))
              ]
            })
          }

          async function showAddEventRow (res?: StringSelectMenuInteraction): Promise<void> {
            await res?.deferUpdate()

            if (res instanceof StringSelectMenuInteraction) {
              server = res.values[0]
            }

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_EVENT_ALERT_ADD_ROW_TITLE', args.language))
                  .setDescription(`${client.translate('COMMAND_EVENT_ALERT_ADD_ROW_DESCRIPTION', args.language)}\n\`IDs:\` \`${convertToRangeString(eventIDs)}\`\n\`Server:\` \`${server}\``)
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_ADD_ID(client.translate('NOTIFICATION_BUTTON_EVENT_ADD_ID', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_GENERIC_SERVER_SELECTION(client.translate('NOTIFICATION_BUTTON_EVENT_GENERIC_SERVER_SELECTION', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_CONFIRM(client.translate('NOTIFICATION_BUTTON_EVENT_CONFIRM', args.language)).setDisabled(eventIDs.length === 0 || server.length <= 1))
              ]
            })
          }

          async function showAddEventsChannelsRow (res: MessageComponentInteraction): Promise<void> {
            await res.deferUpdate()

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_EVENT_ALERT_ADD_CHANNEL_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_EVENT_ALERT_ADD_CHANNEL_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(NOTIFICATION_MENU_EVENT_CHANNEL_SELECTION()),
                new ActionRowBuilder<ButtonBuilder>().addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
              ]
            })
          }

          async function showSettingsChannelSelectionRow (res: MessageComponentInteraction): Promise<void> {
            await res.deferUpdate()

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_EVENT_ALERT_SETTINGS_CHANNEL_SELECTION_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_EVENT_ALERT_SETTINGS_CHANNEL_SELECTION_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(NOTIFICATION_MENU_EVENT_SETTINGS_CHANNEL_SELECTION()),
                new ActionRowBuilder<ButtonBuilder>().addComponents(NOTIFICATION_BUTTON_EVENT_SETTINGS_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_SETTINGS_BACK', args.language)))
              ]
            })
          }

          async function clearChannel (res: ChannelSelectMenuInteraction): Promise<void> {
            await res.deferUpdate()

            let selectedChannels: any[] = []

            res.channels.forEach((c) => {
              selectedChannels = args.guild?.config?.event_notification.filter((x) => x.channel !== c.id) ?? []
            })

            logger.audit('clearChannel', interaction.user.id, `guildId${interaction.guild.id}`, selectedChannels.join(' '))

            await Guild.findOneAndUpdate(
              { id: interaction.guild.id },
              {
                'config.event_notification': selectedChannels
              }
            )

            await showSettingsRow()

            await interaction.followUp({
              content: client.i18n.__({
                phrase: 'COMMAND_EVENT_ALERT_SETTINGS_CLEAR_CHANNEL_TITLE',
                locale: args.language
              }),
              ephemeral: true
            })
          }

          async function collectEventIDs (res: MessageComponentInteraction): Promise<void> {
            await res.deferUpdate()

            await interaction
              .editReply({
                content: client.i18n.__({
                  phrase: 'COMMAND_EVENT_ALERT_EVENT_LIST',
                  locale: args.language
                }),
                components: [],
                embeds: []
              })
              .then((i) => {
                eventIDs = []

                const messageCollector = interaction.channel?.createMessageCollector({ time: 60000 })

                messageCollector?.on('collect', async (messageResponse) => {
                  if (messageResponse.author.id !== interaction.user.id) return

                  messageCollector?.resetTimer({ idle: 60000 })

                  if (messageResponse.cleanContent?.toLowerCase().includes('done')) {
                    messageCollector.stop('done')
                    return
                  }

                  const result = convertStringToArray(messageResponse.cleanContent)

                  if (JSON.stringify(result).includes('null')) {
                    await messageResponse.react('❌')
                    return
                  }

                  await messageResponse.react('✅')

                  for (const array of result) {
                    if (array?.length > 0) {
                      for (const arr of array) {
                        if (!eventIDs.includes(arr)) {
                          eventIDs.push(arr)
                        }
                      }
                    }
                  }
                })

                messageCollector?.on('end', async () => {
                  if (eventIDs.length === 0) {
                    i.delete().catch(() => {})
                    interactionCollector.stop('add-id-timeout')
                    return
                  }

                  await showAddEventRow()
                })
              })
          }

          async function showAddEventsRoleSelection (res: ChannelSelectMenuInteraction): Promise<void> {
            await res.deferUpdate()

            channels = res.channels

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_EVENT_ALERT_ADD_ROLE_SELECTION_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_EVENT_ALERT_ADD_ROLE_SELECTION_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(NOTIFICATION_MENU_EVENT_ROLE_SELECTION()),
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_ROLE_SET_EVERYONE(client.translate('NOTIFICATION_BUTTON_EVENT_ROLE_SET_EVERYONE', args.language)))
              ]
            })
          }

          async function showAddEventsServerSelection (res: MessageComponentInteraction): Promise<void> {
            await res.deferUpdate()

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_EVENT_ALERT_ADD_SERVER_SELECTION_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_EVENT_ALERT_ADD_SERVER_SELECTION_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(GENERIC_SERVER_SELECTION()),
                new ActionRowBuilder<ButtonBuilder>().addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
              ]
            })
          }

          async function showSettingsRoleSelection (res: MessageComponentInteraction): Promise<void> {
            await res.deferUpdate()

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_EVENT_ALERT_ADD_ROLE_SELECTION_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_EVENT_ALERT_ADD_ROLE_SELECTION_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(NOTIFICATION_MENU_EVENT_SETTINGS_ROLE_SELECTION()),
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(NOTIFICATION_BUTTON_EVENT_SETTINGS_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_SETTINGS_BACK', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_SETTINGS_CLEAR_EVERYONE(client.translate('NOTIFICATION_BUTTON_EVENT_SETTINGS_CLEAR_EVERYONE', args.language)))
              ]
            })
          }

          async function showIndexSelectionRow (res?: MessageComponentInteraction): Promise<void> {
            await res?.deferUpdate()

            let string = ''

            for (const eventConfig of args.guild.config.event_notification) {
              const index = args.guild.config.event_notification.indexOf(eventConfig)

              if (string.length <= 3700) {
                string += `\`📍${index}\` \`Channel: \` <#${eventConfig.channel}> \`${eventConfig.server}\`\n┗\`Events: ${convertArrayToString(eventConfig.events)}\`\n┗━\`Roles: \`${formatRoles(
                  eventConfig.roles
                ).join(' ')}\n\n`
              } else {
                string += `> +${args.guild.config.event_notification.length - index}...`
                break
              }
            }

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_EVENT_ALERT_SETTINGS_INDEX_SELECTION_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_EVENT_ALERT_SETTINGS_INDEX_SELECTION_DESCRIPTION', args.language, { string }))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX_ADD(client.translate('NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX_ADD', args.language)).setDisabled(string.length === 0))
              ]
            })
          }

          async function showIndexSelectionModal (res: MessageComponentInteraction): Promise<void> {
            const filter = (r): boolean => r.customId === 'e-index-modal'

            await res.showModal(NOTIFICATION_MODAL_EVENT_INDEX_SELECTION(client, args.language))

            interaction
              .awaitModalSubmit({ filter, time: 25000 })
              .then(async (e) => {
                await e.deferUpdate()

                const index = Number(e.fields.getTextInputValue('index'))

                if (args.guild !== undefined) {
                  if (args.guild.config.event_notification[index] !== undefined) {
                    args.guild.config.event_notification.splice(index, 1)

                    await Guild.findOneAndUpdate(
                      { id: interaction.guild.id },
                      {
                        'config.event_notification': args.guild.config.event_notification
                      }
                    )

                    await showIndexSelectionRow()

                    await res.followUp({
                      content: client.i18n.__({
                        phrase: 'COMMAND_EVENT_ALERT_SETTINGS_CLEAR_INDEX_MODAL_SUCESS',
                        locale: args.language
                      }),
                      ephemeral: true
                    })
                  } else {
                    await res.followUp({
                      content: client.i18n.__({
                        phrase: 'COMMAND_EVENT_ALERT_SETTINGS_CLEAR_INDEX_MODAL_REJECT',
                        locale: args.language
                      }),
                      ephemeral: true
                    })
                  }
                }
              })
              .catch(async () => {
                await res.followUp({
                  content: client.i18n.__({
                    phrase: 'COMMAND_EVENT_ALERT_SETTINGS_CLEAR_INDEX_MODAL_TIMEOUT',
                    locale: args.language
                  }),
                  ephemeral: true
                })
              })
          }

          async function settingsClearRole (res: RoleSelectMenuInteraction): Promise<void> {
            await res.deferUpdate()

            let selectedRoles: any[] = []

            if (res.roles !== undefined) {
              res.roles.forEach((r) => {
                selectedRoles = args.guild.config.event_notification.filter((x) => !x.roles?.includes(r.id))
              })
            } else {
              selectedRoles = args.guild.config.event_notification.filter((x) => !x.roles?.includes('everyone'))
            }

            logger.audit('settingsClearRole', interaction.user.id, `guildId${interaction.guild.id}`, selectedRoles.join(' '))

            await Guild.findOneAndUpdate({ id: interaction.guild.id }, { 'config.event_notification': selectedRoles })

            await showSettingsRow()

            await interaction.followUp({
              content: client.i18n.__({
                phrase: 'COMMAND_EVENT_ALERT_SETTINGS_CLEAR_ROLE_TITLE',
                locale: args.language
              }),
              ephemeral: true
            })
          }

          async function settingsClearGuild (res: MessageComponentInteraction): Promise<void> {
            await res.deferUpdate()

            logger.audit('settingsClearGuild', interaction.user.id, `guildId${interaction.guild.id}`)

            await Guild.findOneAndUpdate({ id: interaction.guild.id }, { 'config.event_notification': [] })

            await showMainMenuRow()

            await interaction.followUp({
              content: client.i18n.__({
                phrase: 'COMMAND_EVENT_ALERT_SETTINGS_CLEAR_GUILD_TITLE',
                locale: args.language
              }),
              ephemeral: true
            })
          }

          async function saveEvents (res: RoleSelectMenuInteraction): Promise<void> {
            await res.deferUpdate()

            if (res.roles !== undefined) {
              roles = res.roles.map((r) => r.id)
            } else {
              roles = ['everyone']
            }

            channels.forEach((c) => {
              const index = args.guild.config.event_notification.findIndex((x) => x.channel === c.id && x.server === server && x.roles === roles && x.events === eventIDs)

              c.fetchWebhooks().then((webhooks) => {
                if (webhooks.size > 0) {
                  if (index === -1) {
                    args.guild.config.event_notification.push({
                      channel: c.id,
                      events: eventIDs,
                      webhook: webhooks.first().url,
                      roles,
                      server
                    })
                  } else {
                    args.guild.config.event_notification[index] = {
                      channel: c.id,
                      events: eventIDs,
                      webhook: webhooks.first().url,
                      roles,
                      server
                    }
                  }
                } else {
                  c.createWebhook({
                    name: 'Event Notification',
                    avatar: 'https://i.imgur.com/VL3e7E8.png'
                  }).then((webhook) => {
                    if (index === -1) {
                      args.guild.config.event_notification.push({
                        channel: c.id,
                        events: eventIDs,
                        webhook: webhook.url,
                        roles,
                        server
                      })
                    } else {
                      args.guild.config.event_notification[index] = {
                        channel: c.id,
                        events: eventIDs,
                        webhook: webhook.url,
                        roles,
                        server
                      }
                    }
                  })
                }
              })
            })

            await interaction.editReply({
              components: [
                new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(NOTIFICATION_MENU_EVENT_SETTINGS_ROLE_SELECTION()),
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_ROLE_SET_EVERYONE(client.translate('NOTIFICATION_BUTTON_EVENT_ROLE_SET_EVERYONE', args.language)).setDisabled(true))
              ]
            })

            setTimeout((): void => {
              logger.audit('saveEvents', interaction.user.id, `guildId${interaction.guild.id}`)

              Guild.findOneAndUpdate(
                { id: interaction.guild.id },
                {
                  'config.event_notification': args.guild.config.event_notification
                }
              )
                .then(async () => {
                  await showAddEventRow()

                  await interaction.followUp({
                    content: client.i18n.__({
                      phrase: 'COMMAND_EVENT_ALERT_ADD_EVENT_TITLE',
                      locale: args.language
                    }),
                    ephemeral: true
                  })
                })
                .catch((e) => {
                  throw new Error(e)
                })
            }, channels.size * 1200)
          }

          interactionCollector.on('collect', async (interactionResponse) => {
            if (interactionResponse.user.id === interaction.user.id) {
              interactionCollector.resetTimer({ idle: 90000 })

              if (Date.now() - lastInteraction <= 1000) {
                await interactionResponse.deferUpdate()

                await interaction.followUp({
                  content: client.i18n.__({
                    phrase: 'COMMAND_EVENT_ALERT_SETTINGS_CLEAR_CHANNEL_TITLE',
                    locale: args.language
                  }),
                  ephemeral: true
                })
                return
              }

              lastInteraction = Date.now()

              switch (interactionResponse.customId) {
                case 'NOTIFICATION_BUTTON_MAINMENU_SETTINGS':
                  await showSettingsRow(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_CLEAR_CHANNEL':
                  await showSettingsChannelSelectionRow(interactionResponse)
                  break

                case 'NOTIFICATION_MENU_EVENT_SETTINGS_CHANNEL_SELECTION':
                  await clearChannel(interactionResponse as ChannelSelectMenuInteraction)
                  break

                case 'NOTIFICATION_BUTTON_MAINMENU_ADD':
                  await showAddEventRow(interactionResponse as StringSelectMenuInteraction)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_ADD_ID':
                  await collectEventIDs(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_BACK':
                  await showMainMenuRow(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_CONFIRM':
                  await showAddEventsChannelsRow(interactionResponse)
                  break

                case 'NOTIFICATION_MENU_EVENT_CHANNEL_SELECTION':
                  await showAddEventsRoleSelection(interactionResponse as ChannelSelectMenuInteraction)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_ROLE_SET_EVERYONE':
                  await saveEvents(interactionResponse as RoleSelectMenuInteraction)
                  break

                case 'NOTIFICATION_MENU_EVENT_ROLE_SELECTION':
                  await saveEvents(interactionResponse as RoleSelectMenuInteraction)
                  break

                case 'GENERIC_SERVER_SELECTION':
                  await showAddEventRow(interactionResponse as StringSelectMenuInteraction)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_GENERIC_SERVER_SELECTION':
                  await showAddEventsServerSelection(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_CLEAR_ROLE':
                  await showSettingsRoleSelection(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_SETTINGS_BACK':
                  await showSettingsRow(interactionResponse)
                  break

                case 'NOTIFICATION_MENU_EVENT_SETTINGS_ROLE_SELECTION':
                  await settingsClearRole(interactionResponse as RoleSelectMenuInteraction)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_SETTINGS_CLEAR_EVERYONE':
                  await settingsClearRole(interactionResponse as RoleSelectMenuInteraction)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_CLEAR_GUILD':
                  await settingsClearGuild(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX':
                  await showIndexSelectionRow(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX_ADD':
                  await showIndexSelectionModal(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_MAINMENU_EXIT':
                  interactionCollector.stop()
                  break

                default:
                  break
              }
            }
          })

          interactionCollector.on('end', async (collected, reason) => {
            if (reason === 'add-id-timeout') {
              await interaction.followUp({
                content: client.i18n.__({
                  phrase: 'COMMAND_EVENT_ALERT_ADD_IDS_TIMEOUT',
                  locale: args.language
                }, { collected }),
                ephemeral: true
              })
              return
            }
            await interaction.deleteReply().catch(() => {})
          })
        })
    }

    async function boostNotification (): Promise<void> {
      await interaction
        .editReply({
          content: '',
          embeds: [
            new CustomEmbed()
              .setTitle(client.translate('COMMAND_BOOST_ALERT_MAIN_ROW_TITLE', args.language))
              .setDescription(client.translate('COMMAND_BOOST_ALERT_MAIN_ROW_DESCRIPTION', args.language))
              .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
              .setColor(client.colors.Indigo)
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(NOTIFICATION_BUTTON_MAINMENU_ADD(client.translate('NOTIFICATION_BUTTON_MAINMENU_ADD', args.language)))
              .addComponents(NOTIFICATION_BUTTON_MAINMENU_SETTINGS(client.translate('NOTIFICATION_BUTTON_MAINMENU_SETTINGS', args.language)))
              .addComponents(NOTIFICATION_BUTTON_MAINMENU_EXIT(client.translate('NOTIFICATION_BUTTON_MAINMENU_EXIT', args.language)))
          ]
        })
        .then((message) => {
          const interactionCollector = message.createMessageComponentCollector({
            time: 90000
          })

          let channels

          let server: string
          let boosts: string[] = []
          let roles: string[] = []

          function formatRoles (arr: string[]): string[] {
            return arr.map((x) => (x === 'everyone' ? '@everyone' : `<@&${x}>`))
          }

          async function showMainMenu (res?: MessageComponentInteraction): Promise<void> {
            await res?.deferUpdate()

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_BOOST_ALERT_MAIN_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_BOOST_ALERT_MAIN_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(NOTIFICATION_BUTTON_MAINMENU_ADD(client.translate('NOTIFICATION_BUTTON_MAINMENU_ADD', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_MAINMENU_SETTINGS(client.translate('NOTIFICATION_BUTTON_MAINMENU_SETTINGS', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_MAINMENU_EXIT(client.translate('NOTIFICATION_BUTTON_MAINMENU_EXIT', args.language)))
              ]
            })
          }

          async function saveBoosts (): Promise<void> {
            channels.forEach((c) => {
              c.fetchWebhooks().then((webhooks) => {
                if (webhooks.size === 0) {
                  c.createWebhook({
                    name: 'Boost Notification',
                    avatar: 'https://i.imgur.com/VL3e7E8.png'
                  }).then((webhook) => {
                    args.guild.config.boost_notification.push({
                      server,
                      boosts,
                      channels: c.id,
                      webhook: webhook.url,
                      roles
                    })
                  })
                } else {
                  args.guild.config.boost_notification.push({
                    server,
                    boosts,
                    channels: c.id,
                    webhook: webhooks.first().url,
                    roles
                  })
                }
              })
            })

            setTimeout((): void => {
              Guild.findOneAndUpdate(
                { id: interaction.guild.id },
                {
                  'config.boost_notification': args.guild.config.boost_notification
                }
              )
                .then(async () => {
                  await showMainMenu()

                  await interaction.followUp({
                    content: client.i18n.__({
                      phrase: 'COMMAND_BOOST_ALERT_ADDED_TITLE',
                      locale: args.language
                    }),
                    ephemeral: true
                  })
                })
                .catch((e) => {
                  throw new Error(e)
                })
            }, channels.size * 1200)
          }

          async function showAddBoostRow (res?: MessageComponentInteraction): Promise<void> {
            server = ''
            boosts = []
            roles = []
            channels = null

            await res?.deferUpdate()

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_BOOST_ALERT_SERVER&BOOST_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_BOOST_ALERT_SERVER&BOOST_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(NOTIFICATION_MENU_BOOST_SELECTION(args.language)),
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(GENERIC_SERVER_SELECTION()),
                new ActionRowBuilder<ButtonBuilder>().addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
              ]
            })
          }

          async function showAddRolesAndChannelSelection (res?: MessageComponentInteraction): Promise<void> {
            await res?.deferUpdate()

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_BOOST_ALERT_CHANNEL&ROLE_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_BOOST_ALERT_CHANNEL&ROLE_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(NOTIFICATION_MENU_EVENT_CHANNEL_SELECTION()),
                new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(NOTIFICATION_MENU_EVENT_ROLE_SELECTION()),
                new ActionRowBuilder<ButtonBuilder>().addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
              ]
            })
          }

          async function showIndexSelectionRow (res?: MessageComponentInteraction): Promise<void> {
            await res?.deferUpdate()

            let string = ''

            for (const boostData of args.guild.config.boost_notification) {
              const index = args.guild.config.boost_notification.indexOf(boostData)

              if (string.length <= 3700) {
                string += `\`📍${index}\` \`Channel: \` <#${boostData.channels}> \`${boostData.server}\`\n\`Boosts: \` ${boostData.boosts.map((x) => ` \`${x}\``).join(' ')}\n\`Roles: \` ${formatRoles(
                  boostData.roles
                ).join(' ')}\n\n`
              } else {
                string += `> +${args.guild.config.boost_notification.length - index}...`
                break
              }
            }

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_BOOST_ALERT_INDEX_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_BOOST_ALERT_INDEX_ROW_DESCRIPTION', args.language, { string }))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX_ADD(client.translate('NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX_ADD', args.language)).setDisabled(string.length === 0))
              ]
            })
          }

          async function showConfigRow (res?: MessageComponentInteraction): Promise<void> {
            await res?.deferUpdate()

            await interaction.editReply({
              content: '',
              embeds: [
                new CustomEmbed()
                  .setTitle(client.translate('COMMAND_BOOST_ALERT_CONFIG_ROW_TITLE', args.language))
                  .setDescription(client.translate('COMMAND_BOOST_ALERT_CONFIG_ROW_DESCRIPTION', args.language))
                  .setAuthor({ name: 'Kakele Biridim', iconURL: client.icons.ElderVampireBrooch })
                  .setColor(client.colors.Indigo)
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(NOTIFICATION_BUTTON_EVENT_BACK(client.translate('NOTIFICATION_BUTTON_EVENT_BACK', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX(client.translate('NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX', args.language)))
                  .addComponents(NOTIFICATION_BUTTON_EVENT_CLEAR_GUILD(client.translate('NOTIFICATION_BUTTON_EVENT_CLEAR_GUILD', args.language)))
              ]
            })
          }

          async function handleBoostSelection (res: RoleSelectMenuInteraction): Promise<void> {
            await res.deferUpdate()

            boosts = res.values

            if (boosts.length > 0 && server.length > 0) {
              await showAddRolesAndChannelSelection()
            }
          }

          async function handleServerSelection (res: StringSelectMenuInteraction): Promise<void> {
            await res?.deferUpdate()

            server = res.values[0]

            if (boosts.length > 0 && server.length > 0) {
              await showAddRolesAndChannelSelection()
            }
          }

          async function handleChannelSelection (res: ChannelSelectMenuInteraction): Promise<void> {
            channels = res.channels

            await res.deferUpdate()

            if (channels !== undefined && roles.length > 0) {
              await saveBoosts()
            }
          }

          async function handleRoleSelection (res: RoleSelectMenuInteraction): Promise<void> {
            roles = res.roles.map((x) => x.id)

            await res.deferUpdate()

            if (channels !== undefined && roles.length > 0) {
              await saveBoosts()
            }
          }

          async function settingsClearGuild (res: MessageComponentInteraction): Promise<void> {
            await res.deferUpdate()

            await Guild.findOneAndUpdate({ id: interaction.guild.id }, { 'config.boost_notification': [] })

            await showMainMenu()

            await interaction.followUp({
              content: client.i18n.__({
                phrase: 'COMMAND_BOOST_ALERT_SETTINGS_CLEAR_GUILD_TITLE',
                locale: args.language
              }),
              ephemeral: true
            })
          }

          async function showIndexSelectionModal (res: MessageComponentInteraction): Promise<void> {
            const filter = (r): boolean => r.customId === 'e-index-modal'

            await res.showModal(NOTIFICATION_MODAL_EVENT_INDEX_SELECTION(client, args.language))

            interaction
              .awaitModalSubmit({ filter, time: 25000 })
              .then(async (e) => {
                await e.deferUpdate()

                const index = Number(e.fields.getTextInputValue('index'))

                if (args.guild.config.boost_notification[index] !== undefined) {
                  args.guild.config.boost_notification.splice(index, 1)

                  await Guild.findOneAndUpdate(
                    { id: interaction.guild.id },
                    {
                      'config.boost_notification': args.guild.config.boost_notification
                    }
                  )

                  await showIndexSelectionRow()

                  await res.followUp({
                    content: client.i18n.__({
                      phrase: 'COMMAND_EVENT_ALERT_SETTINGS_CLEAR_INDEX_MODAL_SUCESS',
                      locale: args.language
                    }),
                    ephemeral: true
                  })
                } else {
                  await res.followUp({
                    content: client.i18n.__({
                      phrase: 'COMMAND_EVENT_ALERT_SETTINGS_CLEAR_INDEX_MODAL_REJECT',
                      locale: args.language
                    }),
                    ephemeral: true
                  })
                }
              })
              .catch(async () => {
                await res.followUp({
                  content: client.i18n.__({
                    phrase: 'COMMAND_EVENT_ALERT_SETTINGS_CLEAR_INDEX_MODAL_TIMEOUT',
                    locale: args.language
                  }),
                  ephemeral: true
                })
              })
          }

          interactionCollector.on('collect', async (interactionResponse) => {
            if (interactionResponse.user.id === interaction.user.id) {
              interactionCollector.resetTimer({ idle: 90000 })

              if (Date.now() - lastInteraction <= 800) {
                await interactionResponse.deferUpdate()

                await interaction.followUp({
                  content: client.i18n.__({
                    phrase: 'COMMAND_BOOST_ALERT_RATELIMIT_TITLE',
                    locale: args.language
                  }),
                  ephemeral: true
                })
                return
              }

              lastInteraction = Date.now()

              switch (interactionResponse.customId) {
                case 'NOTIFICATION_BUTTON_MAINMENU_ADD':
                  await showAddBoostRow(interactionResponse)
                  break

                case 'NOTIFICATION_MENU_BOOST_SELECTION':
                  await handleBoostSelection(interactionResponse as RoleSelectMenuInteraction)
                  break

                case 'GENERIC_SERVER_SELECTION':
                  await handleServerSelection(interactionResponse as StringSelectMenuInteraction)
                  break

                case 'NOTIFICATION_MENU_EVENT_ROLE_SELECTION':
                  await handleRoleSelection(interactionResponse as RoleSelectMenuInteraction)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_BACK':
                  await showMainMenu(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_MAINMENU_SETTINGS':
                  await showConfigRow(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_CLEAR_GUILD':
                  await settingsClearGuild(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX':
                  await showIndexSelectionRow(interactionResponse)
                  break

                case 'NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX_ADD':
                  await showIndexSelectionModal(interactionResponse)
                  break

                case 'NOTIFICATION_MENU_EVENT_CHANNEL_SELECTION':
                  await handleChannelSelection(interactionResponse as ChannelSelectMenuInteraction)
                  break

                case 'NOTIFICATION_BUTTON_MAINMENU_EXIT':
                  interactionCollector.stop()
                  break

                default:
                  break
              }
            }
          })

          interactionCollector.on('end', async () => {
            await interaction.deleteReply().catch(() => {})
          })
        })
    }

    switch (subcommand) {
      case 'events':
        await eventNotifiction()
        break

      case 'boosts':
        await boostNotification()
        break

      default:
        throw new Error('Invalid Subcommand Type')
    }
  }
})
