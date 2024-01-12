import cron from "node-cron";
import "dotenv/config";
import axios from "axios";
import { GIST_KAKELE_RANKINGS } from "../../misc/constants/index.ts";
import { logger } from "../../index.ts";
import { type CharacterData } from "../../structures/misc.ts";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const dataPath = path.join("./data");

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

const require = createRequire(import.meta.url);

interface RawData {
  files: Record<string, { raw_url?: string }>;
}

type PlayerData = Array<CharacterData | { server: string; timestamp: string }>;

function checkDataFolder(): void {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
  }
}

async function getPlayerData(): Promise<void> {
  const dataFolder = fs.readdirSync(dataPath);
  const timestamp = new Date().getTime() - ONE_HOUR_IN_MILLISECONDS;

  const file = dataFolder.find((fileName) => {
    const fileTimestamp = Number(fileName.split(".")[0]);
    return fileTimestamp > timestamp;
  });

  if (file === undefined) {
    try {
      const res = await axios.get<RawData>(GIST_KAKELE_RANKINGS, {
        headers: {
          Authorization: process.env.GITHUB_TOKEN,
        },
      });

      const data = res.data.files;

      const URLs = [
        { name: "red", url: data["south-america-red"]?.raw_url },
        { name: "blue", url: data["south-america-blue"]?.raw_url },
        { name: "lime", url: data["north-america-lime"]?.raw_url },
        { name: "green", url: data["europe-green"]?.raw_url },
        { name: "white", url: data["southeast-asia-white"]?.raw_url },
        { name: "yellow", url: data["south-america-yellow"]?.raw_url },
        { name: "orange", url: data["europe-orange"]?.raw_url },
        { name: "pink", url: data["south-america-pink"]?.raw_url },
        { name: "violet", url: data["north-america-violet"]?.raw_url },
        { name: "gold", url: data["europe-gold"]?.raw_url },
      ];

      const playerData: PlayerData = [];

      for (const { url: serverUrl, name: serverName } of URLs) {
        if (typeof serverUrl === "string" && typeof serverName === "string") {
          const response = await axios.get<{
            content: CharacterData[];
            unix_seconds: string;
          }>(serverUrl, {
            headers: {
              Authorization: process.env.GITHUB_TOKEN,
            },
          });

          const serverData = response.data.content;

          if (serverData !== undefined) {
            for (const player of serverData) {
              player.server = serverName;
              playerData.push(player);
            }

            playerData.push({
              server: serverName,
              timestamp: response.data.unix_seconds,
            });
          }
        }
      }

      const date = Date.now();

      const shouldSavePlayerData =
        JSON.stringify(global.todayPlayerData) !== JSON.stringify(playerData) ||
        playerData.length > global.todayPlayerData?.length;

      if (shouldSavePlayerData) {
        if (fs.existsSync("./data/")) {
          fs.writeFileSync(`./data/${date}.json`, JSON.stringify(playerData));
        }
        global.todayPlayerData = playerData;
        global.todayPlayerDataNames = global.todayPlayerData.map((x) => x.name);
      }

      logger.info("Kakele local player data updated");
    } catch (error) {
      logger.error("Failed to update kakele player data", error);
    }
  } else if (
    global.todayPlayerData === undefined ||
    global.todayPlayerData?.length === 0
  ) {
    const data = await require("../../../data/" + String(file));

    logger.info("Kakele local player data loaded");

    global.todayPlayerData = data;
    global.todayPlayerDataNames = global.todayPlayerData.map((x) => x.name);
  }
}

await (async (): Promise<void> => {
  cron.schedule("0 * * * *", async () => {
    await getPlayerData();
  });

  await checkDataFolder();
  await getPlayerData();
})();
