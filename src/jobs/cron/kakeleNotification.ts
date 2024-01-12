import { startNotificationsWorker } from "../index.ts";
import cron from "node-cron";

await (async (): Promise<void> => {
  cron.schedule("*/2 * * * *", async () => {
    await startNotificationsWorker();
  });
})();
