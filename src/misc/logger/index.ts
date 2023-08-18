import * as winston from 'winston'
import chalk from 'chalk'
import 'winston-daily-rotate-file'
import 'dotenv/config'

async function sendNotification (...props: any[]): Promise<void> {
  await fetch(process.env.NTFY_ERROR_URL as string, {
    method: 'POST',
    body: props.join('\n')
  })
}

export class Logger {
  private readonly isAppInDevelopment: boolean

  constructor (isAppInDevelopment: boolean) {
    this.isAppInDevelopment = isAppInDevelopment
  }

  public error (...args: any[]): void {
    if (this.isAppInDevelopment) {
      this.debug(args.map(x => typeof x === 'object' ? JSON.stringify(x) : x))
    }

    void sendNotification(...args)

    errorLogger.error({
      level: 'error',
      message: args.join(' - ')
    })
  }

  public info (...args: any[]): void {
    if (this.isAppInDevelopment) {
      this.debug(args.map(x => typeof x === 'object' ? JSON.stringify(x) : x))
    }

    generalLogger.log({
      level: 'info',
      message: args.join(' - ')
    })
  }

  public premium (...args: any[]): void {
    if (this.isAppInDevelopment) {
      this.debug(args.map(x => typeof x === 'object' ? JSON.stringify(x) : x))
    }

    premiumLogger.log({
      level: 'info',
      message: args.join(' - ')
    })
  }

  public audit (...args: any[]): void {
    if (this.isAppInDevelopment) {
      this.debug(args.map(x => typeof x === 'object' ? JSON.stringify(x) : x))
    }

    auditLogger.log({
      level: 'info',
      message: args.join(' - ')
    })
  }

  public debug (...args: any[]): void {
    if (!this.isAppInDevelopment) {
      return
    }

    console.log(chalk.hex('#DEADED').bold(args.join(' - ')))
  }
}

// Logging configurations
const premiumLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ message, timestamp }) => {
      return `${timestamp as string}: ${message as string}`
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/premium.log', level: 'info' })
  ]
})

const auditLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ message, timestamp }) => {
      return `${timestamp as string}: ${message as string}`
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log', level: 'info' })
  ]
})

const errorLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ message, timestamp }) => {
      return `${timestamp as string}: ${message as string}`
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  ]
})

const generalLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ message, timestamp }) => {
      return `${timestamp as string}: ${message as string}`
    })
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      level: 'info',
      filename: 'logs/general/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d'
    })
  ]
})
