import { Events, type ActivityOptions, ActivityType } from "discord.js";
import { logger } from "../../index.ts";
import DiscordEvent from "../../structures/event.ts";

export default new DiscordEvent({
  name: Events.ClientReady,
  once: true,
  async run(client) {
    logger.info(
      "ClientReady",
      client.user?.username || "Discord Bot" + " online",
    );

    const activities: Array<(...args: any) => ActivityOptions> = [
      () => {
        return {
          name: "Use the code #viva to start with 7 days of premium!",
          type: ActivityType.Playing,
        };
      },
      () => {
        return {
          name: "I can't find my new staff...",
          type: ActivityType.Playing,
        };
      },
      () => {
        return {
          name: "Kakele Online MMORPG.",
          type: ActivityType.Playing,
        };
      },
      () => {
        return {
          name: "Today I heard a dog speaking, I think I'm crazy.",
          type: ActivityType.Playing,
        };
      },
      () => {
        return {
          name: `Unveiling the secrets of Kakele Realm across ${client.guilds.cache.size} servers.`,
          type: ActivityType.Playing,
        };
      },
      () => {
        return {
          name: "Counting stars in the sky...",
          type: ActivityType.Playing,
        };
      },
      () => {
        return {
          name: "Training hard to become a Kakele legend!",
          type: ActivityType.Playing,
        };
      },
      () => {
        return {
          name: "Reading the Classic Hunter's Lore: Nano's Tales of Triumph",
          type: ActivityType.Playing,
        };
      },
    ];

    function setRandomStatus(): void {
      client.user?.setPresence({
        activities: [
          activities[Math.floor(Math.random() * activities.length)](),
        ],
      });
    }

    setRandomStatus();

    setInterval(
      () => {
        setRandomStatus();
      },
      60 * 1000 * 10,
    );
  },
});
