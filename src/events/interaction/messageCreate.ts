/* eslint-disable no-eval */
import { Events, codeBlock } from 'discord.js'
import DiscordEvent from '../../structures/event.ts'
import 'dotenv/config'
import { getGuild } from '../../misc/database/index.ts'

const owners = process.env.OWNER

async function evalAsync (code: string): Promise<any> {
  return await new Promise((resolve, reject) => {
    try {
      const result = eval(code)
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

async function deleteMessage (message): Promise<void> {
  try {
    await message.delete()
  } catch (error) {
    console.error('Error while deleting the message:', error)
  }
}

function formatResult (result: any): string {
  if (typeof result === 'object') {
    return codeBlock('js', JSON.stringify(result, null, 2).slice(0, 1894))
  }
  return String(result)
}

export default new DiscordEvent({
  name: Events.MessageCreate,
  once: false,
  async run (client, message) {
    if (message.author.bot) return

    const isOwner: boolean = owners?.includes(message.author.id) ?? false

    const args = message.content.trim().split(/ +/)
    const command = args.shift()?.toLowerCase()

    if (message.guildId != null) {
      const guild = await getGuild(message.guildId)

      if (guild.config.delete_message.includes(message.channelId)) {
        message.delete().catch(() => {})
      }
    }

    if (isOwner) {
      if (command === '..exec') {
        if (args.length === 0) {
          await message.reply('Please provide code to evaluate.')
          return
        }

        let silent = false
        let shouldDelete = false

        const cleanedArgs = args.filter((arg) => {
          if (arg === '-s') {
            silent = true
            return false
          } else if (arg === '-d') {
            shouldDelete = true
            return false
          }
          return true
        })

        const code = cleanedArgs.join(' ')

        try {
          let result

          if (code.includes('await')) {
            const asyncFunction = `(async () => { ${code} })()`
            result = await evalAsync(asyncFunction)
          } else {
            result = eval(code)
          }

          if (!silent) {
            const formattedResult = formatResult(result)

            if (shouldDelete) {
              void message.channel.send(formattedResult)
              void deleteMessage(message)
            } else {
              await message.reply(formattedResult)
            }
          }
        } catch (error) {
          if (!silent) {
            await message.reply(`Error: ${String(error.message)}`)
          }
        } finally {
          if (shouldDelete && !silent) {
            void deleteMessage(message)
          }
        }
      } else if (command === '..reload') {
        if (args.length === 0) {
          await message.reply('Please provide the name of the command to reload.')
          return
        }

        const commandName = args[0].toLowerCase()

        try {
          await client.reloadInteractionCommand(commandName, true)

          await message.reply(formatResult('Command reloaded'))
        } catch (error) {
          await message.reply(`Error: ${String(error.message)}`)
        }
      }
    }
  }
})
