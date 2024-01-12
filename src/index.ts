import DiscordClient from "./structures/client.js";
import { Logger } from "./misc/logger/index.ts";
import "dotenv/config";
import { loadCronJobs, startNotificationsWorker } from "./jobs/index.ts";

const isAppInDevelopment = process.env.DEV === "true";

export const logger = new Logger(isAppInDevelopment);

["uncaughtException", "unhandledRejection"].forEach((err) => {
  process.on(err, (...args) => {
    if (isAppInDevelopment) {
      console.log(args);
      return;
    }

    logger.error(err, ...args);
  });
});

export const client = new DiscordClient();

void client.start();

void loadCronJobs();

void startNotificationsWorker();
