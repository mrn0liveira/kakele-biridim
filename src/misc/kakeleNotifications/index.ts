import axios from "axios";
import {
  GIST_KAKELE_BOOSTS,
  GIST_KAKELE_EVENTS,
  KAKELE_BOOST_NAMES,
} from "../constants/index.ts";
import {
  SupportedLanguages,
  type KakeleEvent,
  type KakeleBoost,
} from "../../structures/misc.ts";
import Event, { type IEvent } from "../../database/schemas/event.ts";
import { type IGuild } from "../../database/schemas/guild.ts";
import { WebhookClient } from "discord.js";
import { capitalizeFirstLetter } from "../util/index.ts";
import { logger } from "../../index.ts";
import { type IUser } from "../../database/schemas/user.ts";
import Boost, { type IBoost } from "../../database/schemas/boost.ts";

const defaultEventAlertMessage =
  ":earth_americas: | **[server]**\n:alarm_clock: | [time]\n:dart: | [role]";

interface EventNotification {
  events: number[];
  server: string;
  channel: string;
  webhook: string;
  roles: string[];
}

interface BoostNotification {
  server: string;
  channels: string;
  boosts: string[];
  webhook: string;
  roles: string[];
}

interface EventFiltered {
  data: EventNotification;
  message: string;
  id: string;
  language: string;
  payers: boolean;
  channel?: string;
  server?: string;
  roles?: string[];
}

interface BoostFiltered {
  data: BoostNotification;
  id: string;
  language: string;
  payers: boolean;
  channels?: string;
  server?: string;
  roles?: string[];
}

interface MergedEventData extends EventFiltered {
  webhook: string;
}

interface MergedBoosttData extends BoostFiltered {
  webhook: string;
}

function formatRoles(arr: string[]): string[] {
  return arr.map((x) => (x === "everyone" ? "@everyone" : `<@&${x}>`));
}

function formatBoostNames(event: string, language: string): string {
  if (KAKELE_BOOST_NAMES[event]?.[language] === undefined) return event;

  return KAKELE_BOOST_NAMES[event][language];
}

function replaceMessageKeywords(
  obj: MergedEventData,
  event: IEvent,
  str: string = defaultEventAlertMessage,
): string {
  return str
    .replace("[server]", capitalizeFirstLetter(obj.server ?? "Server"))
    .replace("[time]", `<t:${event.active_until}:R>`)
    .replace("[role]", formatRoles(obj.roles ?? []).join(" "))
    .replace("[event]", event.language[obj.language]);
}

function eventConcatRoles(arr: EventFiltered[]): MergedEventData[] {
  const result: MergedEventData[] = [];
  const map = new Map();

  for (const obj of arr) {
    const key = obj.data.server + obj.data.channel;

    if (!map.has(key)) {
      map.set(key, {
        ...obj.data,
        roles: [...obj.data.roles],
        message: obj.message,
        id: obj.id,
        language: obj.language,
        payers: obj.payers,
        webhook: obj.data.webhook,
      });
      result.push(map.get(key));
    } else {
      map.get(key).roles.push(...obj.data.roles);
    }
  }

  return result;
}

function boostConcatRoles(arr: BoostFiltered[]): MergedBoosttData[] {
  const result: MergedBoosttData[] = [];
  const map = new Map();

  for (const obj of arr) {
    const key = obj.data.server + obj.data.channels;

    if (!map.has(key)) {
      map.set(key, {
        ...obj.data,
        roles: [...obj.data.roles],
        id: obj.id,
        payers: obj.payers,
        language: obj.language,
      });
      result.push(map.get(key));
    } else {
      map.get(key).roles.push(...obj.data.roles);
    }
  }

  return result;
}

function extractServerSuffix(input: string): string {
  const words = input.split("-");
  return words[words.length - 1];
}

async function getEventData(): Promise<Record<string, KakeleEvent[]>> {
  const result: Record<string, KakeleEvent[]> = {};

  const body = await axios.get(GIST_KAKELE_EVENTS, {
    headers: {
      Authorization: process.env.GITHUB_TOKEN,
    },
  });

  const data = body.data.files;

  if (typeof data !== "object") {
    throw new Error("getEventData - Unknown data");
  }

  Object.keys(data).forEach((key) => {
    const sufix = extractServerSuffix(key);

    if (sufix !== "_events" && sufix != null) {
      result[sufix] = JSON.parse(data[key].content)?.content ?? [];
    }
  });

  return result;
}

async function getBoostData(): Promise<Record<string, KakeleBoost[]>> {
  const result: Record<string, KakeleBoost[]> = {};

  const body = await axios.get(GIST_KAKELE_BOOSTS, {
    headers: {
      Authorization: process.env.GITHUB_TOKEN,
    },
  });

  const data = body.data.files;

  if (typeof data !== "object") {
    throw new Error("getBoostData - Unknown data");
  }

  Object.keys(data).forEach((key) => {
    const sufix = extractServerSuffix(key);

    if (sufix !== "_boosts" && sufix != null) {
      result[sufix] = JSON.parse(data[key].content)?.content ?? [];
    }
  });

  return result;
}

async function updateEvents(): Promise<IEvent[]> {
  const events: IEvent[] = [];

  const data = await getEventData();
  const now = Math.round(Date.now() / 1000);

  const dbEvents = (await Event.find({})) ?? [];

  for (const server in data) {
    const serverEvents = data[server];

    if (serverEvents.length > 0) {
      for (const event of serverEvents) {
        const index = dbEvents.findIndex(
          (x) => String(x.id) === String(event.id) && x.server === server,
        );

        if (index === -1) {
          const newEvent = await Event.create({
            id: event.id,
            language: {
              EN: event.name.english,
              PT: event.name.portuguese,
              ES: event.name.spanish,
              PL: event.name.polish,
            },
            server,
            timestamp: now,
            active_until: event.active_until_unix_seconds,
            activation_enabled_unix_seconds:
              event.activation_enabled_unix_seconds,
          });

          events.push(newEvent);
        } else if (
          dbEvents[index].active_until < event.active_until_unix_seconds
        ) {
          //TODO remove later
          dbEvents[index].language = {
            EN: event.name.english,
            PT: event.name.portuguese,
            ES: event.name.spanish,
            PL: event.name.polish,
          };
          dbEvents[index].active_until = event.active_until_unix_seconds;
          dbEvents[index].timestamp = now.toString();
          dbEvents[index].activation_enabled_unix_seconds =
            event.activation_enabled_unix_seconds;

          events.push(dbEvents[index]);
        }
      }
    }
  }

  await Event.bulkSave(dbEvents);

  return events;
}

async function updateBoosts(): Promise<IBoost[]> {
  const boosts: IBoost[] = [];

  const data = await getBoostData();

  const now = Math.round(Date.now() / 1000);

  const dbBoosts = (await Boost.find({})) ?? [];

  for (const server in data) {
    const serverBoosts = data[server];

    if (serverBoosts.length > 0) {
      for (const boost of serverBoosts) {
        const index = dbBoosts.findIndex(
          (x) => x.id === boost.id && x.server === server,
        );

        if (index === -1) {
          const newBoost = await Boost.create({
            id: boost.id,
            server,
            timestamp: now,
            active_until: boost.active_until_unix_seconds,
          });

          boosts.push(newBoost);
        } else if (
          dbBoosts[index].active_until < boost.active_until_unix_seconds
        ) {
          dbBoosts[index].active_until = boost.active_until_unix_seconds;
          dbBoosts[index].timestamp = now.toString();

          boosts.push(dbBoosts[index]);
        }
      }
    }
  }

  await Boost.bulkSave(dbBoosts);

  return boosts;
}

function filterEventGuilds(
  arr: IGuild[],
  eventId: string,
  server: string,
): EventFiltered[] {
  const result: EventFiltered[] = [];

  for (const guild of arr) {
    const data = guild.config.event_notification;

    const payers = guild.vip?.payers.filter((x: IUser) => {
      if (typeof x === "object" && x != null) {
        if (new Date() < new Date(x.vip_data?.expiration_date ?? 0)) {
          return true;
        }
      }
      return false;
    });

    for (const guildEventData of data) {
      if (
        guildEventData.events.includes(Number(eventId)) &&
        guildEventData.server === server
      ) {
        result.push({
          data: guildEventData,
          message: defaultEventAlertMessage,
          language: guild.language ?? SupportedLanguages.EN,
          id: guild.id,
          payers: payers.length > 0,
        });
      }
    }
  }
  return result;
}

function filterBoostGuilds(
  arr: IGuild[],
  eventId: string,
  server: string,
): BoostFiltered[] {
  const result: BoostFiltered[] = [];

  for (const guild of arr) {
    const data = guild.config.boost_notification;

    const payers = guild.vip?.payers.filter((x: IUser) => {
      if (typeof x === "object" && x != null) {
        if (new Date() < new Date(x.vip_data?.expiration_date ?? 0)) {
          return true;
        }
      }
      return false;
    });

    for (const guildBoostData of data) {
      if (
        guildBoostData.boosts.includes(eventId) &&
        guildBoostData.server === server
      ) {
        result.push({
          data: guildBoostData,
          id: guild.id,
          payers: payers?.length > 0,
          language: guild.language ?? SupportedLanguages.EN,
        });
      }
    }
  }
  return result;
}

async function notifyEvents(guilds: IGuild[]): Promise<void> {
  const events = await updateEvents();

  const now = Math.round(Date.now() / 1000);

  if (events.length > 0) {
    for (const event of events) {
      if (
        Number(event.active_until) >= now &&
        now - Number(event.timestamp) <= 30
      ) {
        const filteredGuilds =
          eventConcatRoles(filterEventGuilds(guilds, event.id, event.server)) ??
          [];

        for (const guild of filteredGuilds) {
          if (guild.payers) {
            logger.debug(
              "notifyEvents",
              event.language.EN,
              guild.id,
              event.server,
            );

            const webhookClient = new WebhookClient({ url: guild.webhook });
            webhookClient
              .send({
                content: replaceMessageKeywords(guild, event),
                username: event.language[guild.language] ?? event.language.EN,
              })
              .catch((e) => {
                logger.error(
                  "notifyEvents",
                  e.message,
                  `guildId-${guild.id}`,
                  `channelId-${guild.channel as string}`,
                );
              });
          }
        }
      }
    }
  }
}

async function notifyBoosts(guilds: IGuild[]): Promise<void> {
  const boosts = await updateBoosts();

  const now = Math.round(Date.now() / 1000);

  if (boosts.length > 0) {
    for (const boost of boosts) {
      if (
        Number(boost.active_until) >= now &&
        now - Number(boost.timestamp) <= 30
      ) {
        const filteredGuilds = boostConcatRoles(
          filterBoostGuilds(guilds, boost.id, boost.server),
        );

        for (const guild of filteredGuilds) {
          if (guild.payers) {
            logger.debug("notifyBoosts", boost.id, guild.id, boost.server);

            const webhookClient = new WebhookClient({ url: guild.webhook });
            webhookClient
              .send({
                content: `**🌎 ${capitalizeFirstLetter(
                  boost.server,
                )}**\n⏰ <t:${boost.active_until}:R>\n📌 ${formatRoles(
                  guild.roles ?? [],
                ).join(" ")}`,
                username: formatBoostNames(boost.id, guild.language),
              })
              .catch((e) => {
                logger.error(
                  "notifyBoosts",
                  e.message,
                  `guildId-${guild.id}`,
                  `channelId-${guild.channels as string}`,
                );
              });
          }
        }
      }
    }
  }
}

export { notifyBoosts, notifyEvents };
