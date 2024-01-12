import fs from "fs";
import { logger } from "../index.js";
import { sleep } from "../misc/util/index.js";
import {
  notifyBoosts,
  notifyEvents,
} from "../misc/kakeleNotifications/index.ts";
import { getGuilds } from "../misc/database/index.ts";

export async function loadCronJobs(): Promise<void> {
  const jobs = fs.readdirSync("./src/jobs/cron");

  await Promise.all(
    jobs.map(async (job) => {
      try {
        await import("./cron/" + job);
      } catch (error) {
        logger.error(`Error loading cron job ${job}:`, error);
      }
    }),
  );
}

export async function startNotificationsWorker(): Promise<void> {
  const guilds = await getGuilds({ "vip.payers": { $exists: true } });

  await notifyEvents(guilds);
  await sleep(10 * 10000);
  await notifyBoosts(guilds);
}
