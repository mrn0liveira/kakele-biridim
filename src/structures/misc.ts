import { type IGuild } from "../database/schemas/guild.ts";
import { type IUser } from "../database/schemas/user.ts";

export interface UserRateLimit {
  user: string;
  attempts: number;
}

export interface EmbedAuthorOptions {
  name: string;
  iconURL?: string;
  url?: string;
}

export interface CharacterData {
  name: string;
  experience: string;
  vocation: string;
  gold: string;
  pet_points: string;
  achievements: string;
  login_points: string;
  guild: string;
  total_attack: string;
  total_armor: string;
  total_magic: string;
  server?: string;
  progress?: number | string;
  timestamp?: string | null;
}

export enum SupportedLanguages {
  EN = "EN",
  PT = "PT",
  PL = "PL",
  ES = "ES",
}

export enum SupportedLanguagesString {
  english = "english",
  polish = "polish",
  portuguese = "portuguese",
  spanish = "spanish",
}

export interface InteractionArgs {
  user: IUser;
  guild?: IGuild;
  language: SupportedLanguages;
}

export interface GuildInteractionArgs extends InteractionArgs {
  guild: IGuild;
}

export interface KakeleMonster {
  energy: string;
  experience: number;
  health: number;
  gold: number;
  name: string;
  image: string;
  loot: string[];
  boss?: boolean;
  "language.pt": string;
  "language.es": string;
  "language.pl": string;
}

export interface KakeleItem {
  level: number;
  vocation: string;
  energy: string;
  value: number;
  sources: string;
  name: string;
  rarity: string;
  image: string;
  type: string;
  stats?: {
    attack?: number;
    magic?: number;
    armor?: number;
  };
  "language.pt": string;
  "language.es": string;
  "language.pl": string;
}

export interface EquipmentResources {
  copper: number;
  tin: number;
  silver: number;
  iron: number;
  gold: number;
  money: number;
}

export interface EquipmentResourceData {
  first: number;
  second: number;
  total?: EquipmentResources;
  current?: EquipmentResources;
}

export interface TextData {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  font: string;
  color: string;
  alpha?: number;
  textAlign?: CanvasTextAlign;
}

interface LanguageTranslations {
  english: string;
  portuguese: string;
  spanish: string;
  polish: string;
}

export interface KakeleEvent {
  id: string;
  name: LanguageTranslations;
  active_until_unix_seconds: string;
  activation_enabled_unix_seconds: string;
}

export interface KakeleBoost {
  id: string;
  active_until_unix_seconds: string;
}
