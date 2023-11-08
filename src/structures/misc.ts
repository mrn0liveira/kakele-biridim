import { type IGuild } from '../database/schemas/guild.ts'
import { type IUser } from '../database/schemas/user.ts'

export interface UserRateLimit {
  user: string
  attempts: number
}

export interface EmbedAuthorOptions {
  name: string
  iconURL?: string
  url?: string
}

export interface CharacterData {
  name: string
  experience: string
  vocation: string
  gold: string
  pet_points: string
  achievements: string
  login_points: string
  guild: string
  total_attack: string
  total_armor: string
  total_magic: string
  server?: string
  progress?: number | string
  timestamp?: string | null
}

export enum SupportedLanguages {
  EN = 'EN',
  PT = 'PT',
  PL = 'PL',
  ES = 'ES',
}

export enum SupportedLanguagesString {
  english = 'english',
  polish = 'polish',
  portuguese = 'portuguese',
  spanish = 'spanish'
}

export interface InteractionArgs {
  user: IUser
  guild?: IGuild
  language: SupportedLanguages
}

export interface GuildInteractionArgs extends InteractionArgs {
  guild: IGuild
}

export interface KakeleMonster {
  name: {
    english: string
    portuguese: string
    spanish: string
    polish: string
  }
  loot: string
  gold: string
  health: string
  experience: string
  energy: string
  boss?: boolean
}

export interface KakeleItem {
  level?: string
  vocation?: string
  energy?: string
  value: string
  sources: string
  name: {
    english: string
    polish: string
    portuguese: string
    spanish: string
  }
  rarity?: string
  type: string
  slot?: string
  stats?: {
    attack: number
    armor: number
    magic: number
  }
}

export interface EquipmentResources {
  copper: number
  tin: number
  silver: number
  iron: number
  gold: number
  money: number
}

export interface EquipmentResourceData {
  first: number
  second: number
  total?: EquipmentResources
  current?: EquipmentResources
}

export interface TextData {
  text: string
  x: number
  y: number
  fontSize: number
  font: string
  color: string
  alpha?: number
  textAlign?: CanvasTextAlign
}

interface LanguageTranslations {
  english: string
  portuguese: string
  spanish: string
  polish: string
}

export interface KakeleEvent {
  id: string
  name: LanguageTranslations
  active_until_unix_seconds: string
  activation_enabled_unix_seconds: string
}

export interface KakeleBoost {
  id: string
  active_until_unix_seconds: string
}
