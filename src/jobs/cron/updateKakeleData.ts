import cron from 'node-cron'
import 'dotenv/config'
import axios from 'axios'
import { GIST_KAKELE_RANKINGS } from '../../misc/constants/index.ts'
import { logger } from '../../index.ts'
import { type CharacterData } from '../../structures/misc.ts'
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const dataPath = path.join('./data')

const require = createRequire(import.meta.url)

interface RawData {files: Record<string, { raw_url?: string }>}

type PlayerData = Array<CharacterData | { server: string, timestamp: string }>

async function getPlayerData (): Promise<void> {
  const dataFolder = fs.readdirSync(dataPath)
  const timestamp = new Date().getTime() - 43200000

  const file = dataFolder.find(x => Number(x.split('.')[0]) > timestamp)

  if (file === undefined) {
    try {
      const res = await axios.get<RawData>(GIST_KAKELE_RANKINGS, {
        headers: {
          Authorization: process.env.GITHUB_TOKEN
        }
      })

      const data = res.data.files

      const URLs: Array<{ name: string, url?: string }> = [
        { name: 'red', url: data['south-america-red']?.raw_url },
        { name: 'blue', url: data['south-america-blue']?.raw_url },
        { name: 'lime', url: data['north-america-lime']?.raw_url },
        { name: 'green', url: data['europe-green']?.raw_url },
        { name: 'white', url: data['southeast-asia-white']?.raw_url },
        { name: 'yellow', url: data['south-america-yellow']?.raw_url },
        { name: 'orange', url: data['europe-orange']?.raw_url },
        { name: 'pink', url: data['south-america-pink']?.raw_url },
        { name: 'violet', url: data['north-america-violet']?.raw_url }
      ]

      const playerData: PlayerData = []

      for (const { url: serverUrl, name: serverName } of URLs) {
        if (typeof serverUrl === 'string' && typeof serverName === 'string') {
          const response = await axios.get<{ content: CharacterData[], unix_seconds: string }>(serverUrl, {
            headers: {
              Authorization: process.env.GITHUB_TOKEN
            }
          })

          const serverData = response.data.content

          if (serverData !== undefined) {
            for (const player of serverData) {
              player.server = serverName
              playerData.push(player)
            }

            playerData.push({ server: serverName, timestamp: response.data.unix_seconds })
          }
        }
      }

      const date = Date.now()

      if (JSON.stringify(global.todayPlayerData) !== JSON.stringify(playerData) || playerData.length > global.todayPlayerData?.length) {
        if (fs.existsSync('./data/')) {
          fs.writeFileSync(`./data/${date}.json`, JSON.stringify(playerData))
        }
        global.todayPlayerData = playerData
        global.todayPlayerDataNames = global.todayPlayerData.map(x => x.name)
      }

      logger.debug('Kakele player data updated')
    } catch (e) {
      logger.error('Failed to update kakele player data', e)
    }
  } else if (global.todayPlayerData === undefined || global.todayPlayerData?.length === 0) {
    const data = await require('../../../data/' + String(file))

    logger.debug('Kakele local player data loaded')

    global.todayPlayerData = data
    global.todayPlayerDataNames = global.todayPlayerData.map(x => x.name)
  }
}

await (async (): Promise<void> => {
  cron.schedule('0 * * * *', async () => {
    await getPlayerData()
  })

  await getPlayerData()
})()
