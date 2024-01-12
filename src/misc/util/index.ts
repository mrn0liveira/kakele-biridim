import { pathToFileURL } from "node:url";
import {
  type PermissionResolvable,
  type PermissionsString,
  type ColorResolvable,
  PermissionsBitField,
  EmbedBuilder,
  type EmbedAuthorOptions,
  type EmbedFooterOptions,
} from "discord.js";
import { KAKELE_ITEM_ICONS_URL } from "../constants/index.ts";
import { type IOfferItemDocument } from "../../database/schemas/marketplace-item.ts";
import {
  SupportedLanguagesString,
  type EquipmentResources,
} from "../../structures/misc.ts";

export function formatDateTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export function generateDarkRandomColorHex(): string {
  const minBrightness = 20;
  const maxBrightness = 30;

  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  const brightness = (red + green + blue) / 3;

  if (brightness >= minBrightness && brightness <= maxBrightness) {
    const hexColor = `#${((red << 16) | (green << 8) | blue)
      .toString(16)
      .padStart(6, "0")}`;
    return hexColor.toUpperCase();
  } else {
    return generateDarkRandomColorHex();
  }
}

export function calculatePremiumDays(
  currentDate: Date,
  coins: number,
): { premiumDays: number; premiumExpiration: Date } {
  const date = new Date(currentDate);

  const premiumDays = Math.floor((coins / 50) * 30);
  const premiumExpiration = new Date(
    date.getTime() + premiumDays * 24 * 60 * 60 * 1000,
  );
  return { premiumDays, premiumExpiration };
}

export async function sleep(ms): Promise<any> {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatEmojiName(emojiName: string): string {
  return emojiName.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getLanguageName(
  languageCode: string,
): SupportedLanguagesString {
  switch (languageCode) {
    case "ES":
      return SupportedLanguagesString.spanish;

    case "PL":
      return SupportedLanguagesString.polish;

    case "PT":
      return SupportedLanguagesString.portuguese;

    case "EN":
    default:
      return SupportedLanguagesString.english;
  }
}

export function chunkArray(arr: any[], size: number): any[] {
  return arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];
}

export async function dynamicImport(path: string): Promise<any> {
  const module = await import(pathToFileURL(path).toString());
  return module?.default;
}

export function missingPerms(
  memberPerms: PermissionResolvable,
  requiredPerms: PermissionResolvable,
): PermissionsString[] {
  return new PermissionsBitField(memberPerms).missing(
    new PermissionsBitField(requiredPerms),
  );
}

export function getMarketplaceStatsString({
  item,
}: IOfferItemDocument): string {
  return `${
    item.stats?.magic !== undefined && item.stats.magic > 0
      ? ` <:kakelemagic:1046162006278934568> ${item.stats.magic}`
      : ""
  }${
    item.stats?.attack !== undefined && item.stats.attack > 0
      ? ` <:kakeleattack:1046161996288106627>  ${item.stats.attack}`
      : ""
  }${
    item.stats?.armor !== undefined && item.stats.armor > 0
      ? ` <:kakelearmor:1046161994308407326>  ${item.stats.armor}`
      : ""
  }${
    item.stats?.bless !== undefined && item.stats.bless > 0
      ? ` <:kakelebless:1046161998397841439> ${item.stats.bless}`
      : ""
  }`;
}

export function getMarketplcaePriceString({
  item,
}: IOfferItemDocument): string {
  return `${
    item.price.gold > 0
      ? `\`${new Intl.NumberFormat().format(
          item.price.gold,
        )}\` <:kakelegold:1046162004471193730>`
      : ""
  }${
    item.price.coins > 0
      ? `\`${new Intl.NumberFormat().format(
          item.price.coins,
        )}\` <:kakelecoins:1046162000339816618> `
      : ""
  }${
    item.price.money.amount > 0
      ? `\`${new Intl.NumberFormat().format(item.price.money.amount)} ${
          item.price.money.currency
        }\` <:kakelemoney:1121149260482752628>`
      : ""
  }`;
}

export function getMaxExperienceAtLevel(level: number): number {
  if (level < 200) {
    return 10 * level * level * level - 1;
  }
  if (level < 1200) {
    return Math.floor((10 * level * level * level * level) / 200) - 1;
  }
  return (
    Math.floor(
      (Math.floor((10 * level * level * level * level) / 200) * level) / 1200,
    ) - 1
  );
}

export function getExperienceToLevel(level: number): number {
  return getMaxExperienceAtLevel(level - 1) + 1;
}

export function getLevel(experience: number): number {
  for (let level = 0; level < 2000; level += 1) {
    if (getMaxExperienceAtLevel(level) >= experience) {
      return level;
    }
  }
  return 0;
}

export function getExperienceToNextLevel(level: number): number {
  return getMaxExperienceAtLevel(level) - getMaxExperienceAtLevel(level - 1);
}

export function getEquipmentUpgradeResources(
  value: number,
): EquipmentResources {
  let cost = 10000;
  const resources = {
    copper: 0,
    tin: 0,
    silver: 0,
    iron: 0,
    gold: 0,
    money: 0,
  };

  for (let index = 0; index < value; index += 1) {
    resources.money += cost;

    resources.gold += resources.iron >= 5 ? 5 : 0;
    resources.iron += resources.silver >= 5 ? 5 : 0;
    resources.silver += resources.tin >= 5 ? 5 : 0;
    resources.tin += resources.copper >= 5 ? 5 : 0;
    resources.copper += 5;

    if (index > 0) {
      cost += cost;
    }
  }

  return resources;
}

export function getHealthRefinementCost(value: number): number {
  let progressiveCost: number = 1000;
  let totalCost: number = 0;
  const turn: { index: number; type: number } = {
    index: 0,
    type: 0,
  };

  for (let index: number = 0; index < value; index += 1) {
    totalCost += progressiveCost;

    if (turn.index === 2 && turn.type === 0) {
      progressiveCost += progressiveCost;
      turn.type = 1;
      turn.index = 0;
    } else if (turn.index === 1 && turn.type === 1) {
      progressiveCost += progressiveCost;
      turn.type = 0;
      turn.index = 0;
    } else {
      turn.index += 1;
    }
  }
  return totalCost;
}

export function getManaRefinementCost(value: number): number {
  let progressiveCost: number = 1000;
  let totalCost: number = 0;
  const turn: { index: number; type: number } = {
    index: 0,
    type: 0,
  };

  for (let index: number = 0; index < value; index += 1) {
    if (index < 5) {
      totalCost += progressiveCost;
      if (turn.index === 2 && turn.type === 0) {
        progressiveCost += progressiveCost;
        turn.type = 1;
        turn.index = 0;
      } else if (turn.index === 1 && turn.type === 1) {
        progressiveCost += progressiveCost;
        turn.type = 0;
        turn.index = 0;
      } else {
        turn.index += 1;
      }
    } else {
      if (index === 5) turn.index = 0;
      totalCost += progressiveCost;

      if (turn.index === 4) {
        progressiveCost += progressiveCost;
        turn.index = 0;
      } else {
        turn.index += 1;
      }
    }
  }
  return totalCost;
}

export class CustomEmbed {
  public data;

  constructor() {
    this.data = new EmbedBuilder()
      .setAuthor({
        name: "Biridim",
        iconURL: KAKELE_ITEM_ICONS_URL.ElderVampireBrooch,
      })
      .setColor(0xe2725b);
  }

  setAuthor(options: EmbedAuthorOptions): any {
    this.data.setAuthor(options);
    return this.data;
  }

  setImage(url: string): any {
    this.data.setImage(url);
    return this.data;
  }

  setTitle(title: string): any {
    this.data.setTitle(title);
    return this.data;
  }

  setDescription(description: string): any {
    this.data.setDescription(description);
    return this.data;
  }

  setColor(color: ColorResolvable): any {
    this.data.setColor(color);
    return this.data;
  }

  setFooter(options: EmbedFooterOptions): any {
    this.data.setFooter(options);
    return this.data;
  }
}
