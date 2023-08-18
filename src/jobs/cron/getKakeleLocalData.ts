import cron from 'node-cron'
import path from 'path'
import fs from 'fs'

import { createRequire } from 'module'
import { logger } from '../../index.ts'

const require = createRequire(import.meta.url)

const dataPath = path.join('./data')

function findNearest (array: any[], value: number): string {
  const diferencaAbsoluta = array.map((elem) => Math.abs(elem.split('.')[0] - value))
  const indiceDoMinimo = diferencaAbsoluta.indexOf(Math.min(...diferencaAbsoluta))
  return array[indiceDoMinimo]
}

function observeVariable (variableName, callback): any {
  if (global[variableName] !== undefined) {
    callback()
    return
  }

  Object.defineProperty(global, variableName, {
    get () {
      return this[`_${variableName as string}`]
    },
    set (value) {
      this[`_${variableName as string}`] = value
      callback()
    }
  })
}

const getPreviousMonday = (date?: Date): Date => {
  const prevMonday = date ?? new Date()
  prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7)
  return prevMonday
}

async function getKakeleWeekly (): Promise<void> {
  const dataFolder = fs.readdirSync(dataPath)

  let monday = getPreviousMonday().setHours(6)
  const now = Date.now()

  if (monday >= now) {
    monday -= 604800000
  }

  const timestamp = findNearest(dataFolder, monday)

  const weeklyData = require('../../../data/' + timestamp)

  for (const player of weeklyData) {
    const index = global.todayPlayerData.findIndex((x) => x.name === player.name &&
    x.server === player.server &&
    x.vocation === player.vocation)

    if (index !== -1) {
      player.progress = global.todayPlayerData[index].experience - player.experience
    } else {
      player.progress = 0
    }
  }

  if (weeklyData !== global.weeklyPlayerData || global.weeklyPlayerData === undefined) {
    weeklyData.timestamp = {
      new: new Date().getTime(),
      old: Number(timestamp.split('.')[0])
    }

    global.weeklyPlayerData = weeklyData

    logger.debug('Kakele weekly player data updated')
  }
}

async function getKakeleDaily (): Promise<void> {
  const dataFolder = fs.readdirSync(dataPath)

  const timestamp = findNearest(dataFolder, new Date().getTime() - 86400000)

  const dailyData = require('../../../data/' + timestamp)

  for (const player of dailyData) {
    const index = global.todayPlayerData.findIndex((x) => x.name === player.name &&
    x.server === player.server &&
    x.vocation === player.vocation)

    if (index !== -1) {
      player.progress = global.todayPlayerData[index].experience - player.experience
    } else {
      player.progress = 0
    }
  }

  if (dailyData !== global.dailyPlayerData || global.dailyPlayerData === undefined) {
    dailyData.timestamp = {
      new: new Date().getTime(),
      old: Number(timestamp.split('.')[0])
    }

    global.dailyPlayerData = dailyData

    logger.debug('Kakele daily player data updated')
  }
}

await (async (): Promise<void> => {
  cron.schedule('15 * * * *', async () => {
    await getKakeleDaily()
  })

  cron.schedule('30 * * * *', async () => {
    await getKakeleWeekly()
  })

  observeVariable('todayPlayerData', async () => {
    await getKakeleDaily()
    await getKakeleWeekly()
  })
})()
