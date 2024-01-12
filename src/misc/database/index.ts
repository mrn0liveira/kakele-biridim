import Event, { type IEvent } from "../../database/schemas/event.ts";
import { type IGuild, Guild } from "../../database/schemas/guild.ts";
import {
  MarketplaceItem,
  type IOfferItemDocument,
} from "../../database/schemas/marketplace-item.ts";
import User, { type IUser } from "../../database/schemas/user.ts";
import cachegoose from "recachegoose";

/**
 * Retrieves a guild by its ID.
 *
 * @param {string} id - The ID of the discord guild.
 * @return {Promise<IGuild>} A promise that resolves to the guild object.
 */
export async function getGuild(id: string): Promise<IGuild> {
  // @ts-ignore
  let guild = await Guild.findOne({ id }).populate([
    { path: "vip.payers", strictPopulate: false },
  ]);

  if (guild === null) {
    guild = await Guild.create({ id });
  }

  return guild;
}

/**
 * Retrieves a user from the database based on the provided ID.
 *
 * @param {string} id - The ID of the discord user to retrieve.
 * @return {Promise<IUser>} A promise that resolves to the retrieved user.
 */
export async function getUser(id: string): Promise<IUser> {
  // @ts-ignore
  let user = await User.findOne({ id }).cache(30, `userId${id}`);

  if (user === null) {
    user = await User.create({ id });
  }

  return user;
}

/**
 * Retrieves a list of market items based on the provided query.
 *
 * @param {any} query - The query object used to filter the market items.
 * @return {Promise<IOfferItemDocument[]>} A promise that resolves to an array of offer item documents.
 */
export async function getMarketList(query: any): Promise<IOfferItemDocument[]> {
  const items: IOfferItemDocument[] = await MarketplaceItem.find(query)
    .populate([{ path: "owner", strictPopulate: false }])
    // @ts-ignore
    .cache(10, `marketList${JSON.stringify(query)}`);

  return items;
}

/**
 * Retrieves a list of guilds based on the given query.
 *
 * @param {any} query - The query object used to filter the guilds.
 * @return {Promise<IGuild[]>} - A Promise that resolves to an array of guilds that match the query.
 */
export async function getGuilds(query: any): Promise<IGuild[]> {
  const guilds: IGuild[] = await Guild.find(query)
    .populate([{ path: "vip.payers", strictPopulate: false }])
    // @ts-ignore
    .cache(300, `guilds${JSON.stringify(query)}`);

  return guilds;
}

/**
 * Retrieves events based on the provided query.
 *
 * @param {any} query - The query object used to filter kakele events.
 * @return {Promise<IEvent[]>} A promise that resolves to an array of events.
 */
export async function getKakeleEvents(query: any): Promise<IEvent[]> {
  // @ts-ignore
  const events: IEvent[] = await Event.find(query).cache(
    300,
    `events${JSON.stringify(query)}`,
  );

  return events;
}

/**
 * Clears the cache for a specific custom ID.
 *
 * @param {string} customId - The custom ID to clear the cache for.
 * @return {void} No return value.
 */
export function clearCache(customId: string): void {
  cachegoose.clearCache(customId, () => {});
}
