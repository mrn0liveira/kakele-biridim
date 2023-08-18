import { type IGuild, Guild } from '../../database/schemas/guild.ts'
import { MarketplaceItem, type IOfferItemDocument } from '../../database/schemas/marketplace-item.ts'
import User, { type IUser } from '../../database/schemas/user.ts'
import cachegoose from 'recachegoose'

/**
 * Retrieves a guild by ID, creating a new one if not found.
 * @param id - The ID of the guild.
 * @returns A promise resolving to the retrieved or newly created guild.
 */
export async function getGuild (id: string): Promise<IGuild> {
  // @ts-expect-error Ignore cache dependency
  let guild = await Guild.findOne({ id }).populate([{ path: 'vip.payers', strictPopulate: false }]).cache(90, `guildId${id}`)

  if (guild === null) {
    guild = await Guild.create({ id })
  }

  return guild
}

/**
 * Retrieves a user by ID, creating a new one if not found.
 * @param id - The ID of the user.
 * @returns A promise resolving to the retrieved or newly created user.
 */
export async function getUser (id: string): Promise<IUser> {
  // @ts-expect-error Ignore cache dependency
  let user = await User.findOne({ id }).cache(30, `userId${id}`)

  if (user === null) {
    user = await User.create({ id })
  }

  return user
}

/**
 * Retrieves a list of marketplace items based on the provided query.
 * @param query - The query object to filter marketplace items.
 * @returns A promise resolving to the list of marketplace items.
 */
export async function getMarketList (query: any): Promise<IOfferItemDocument[]> {
  // @ts-expect-error Ignore cache dependency
  const items: IOfferItemDocument[] = await MarketplaceItem.find(query).populate([{ path: 'owner', strictPopulate: false }]).cache(10, `marketList${JSON.stringify(query)}`)

  return items
}

export async function getGuilds (query: any): Promise<IGuild[]> {
  // @ts-expect-error Ignore cache dependency
  const guilds: IGuild[] = await Guild.find(query).populate([{ path: 'vip.payers', strictPopulate: false }]).cache(10, `guilds${JSON.stringify(query)}`)

  return guilds
}

export function clearCache (customId: string): void {
  cachegoose.clearCache(customId, () => {})
}
