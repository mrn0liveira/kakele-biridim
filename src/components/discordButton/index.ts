import { ButtonBuilder, ButtonStyle } from "discord.js";

export function MARKETPLACE_MAIN_ADD(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketPlus:1128425374326468608>")
    .setStyle(ButtonStyle.Primary)
    .setCustomId("MARKETPLACE_MAIN_ADD");

  return button;
}

export function MARKETPLACE_MAIN_MANAGE(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakelemanage:1121534331945488506> ")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_MAIN_MANAGE");

  return button;
}

export function MARKETPLACE_MAIN_RULES(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakelerules:1121534073899327568> ")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_MAIN_RULES");

  return button;
}

export function MARKETPLACE_MAIN_EXIT(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("MARKETPLACE_MAIN_EXIT");

  return button;
}

export function MARKETPLACE_ADD_BACK(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("MARKETPLACE_ADD_BACK");

  return button;
}

export function MARKETPLACE_ADD_ITEM(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketSearch:1128425383876886628>")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_ITEM");

  return button;
}

export function MARKETPLACE_ADD_STATS(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketStats:1128425449853308969>")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_STATS");

  return button;
}

export function MARKETPLACE_ADD_STATS_MAGIC(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakelemagic:1046162006278934568> ")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_STATS_MAGIC");

  return button;
}

export function MARKETPLACE_ADD_STATS_ATTACK(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakeleattack:1046161996288106627> ")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_STATS_ATTACK");

  return button;
}

export function MARKETPLACE_ADD_STATS_ARMOR(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakelearmor:1046161994308407326> ")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_STATS_ARMOR");

  return button;
}

export function MARKETPLACE_ADD_STATS_BLESS(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakelebless:1046161998397841439>")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_STATS_BLESS");

  return button;
}

export function MARKETPLACE_ADD_PRICE(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketPrice:1128425381834260560>")
    .setStyle(ButtonStyle.Success)
    .setCustomId("MARKETPLACE_ADD_PRICE");

  return button;
}

export function MARKETPLACE_ADD_PRICE_COINS(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakelecoins:1046162000339816618>")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_PRICE_COINS");

  return button;
}

export function MARKETPLACE_ADD_PRICE_GOLD(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakelegold:1046162004471193730> ")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_PRICE_GOLD");

  return button;
}

export function MARKETPLACE_ADD_PRICE_MONEY(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakelemoney:1121149260482752628> ")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_PRICE_MONEY");

  return button;
}

export function MARKETPLACE_ADD_PRICE_CONFIRM(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketAdd:1128425361923899514>")
    .setStyle(ButtonStyle.Primary)
    .setCustomId("MARKETPLACE_ADD_PRICE_CONFIRM");

  return button;
}

export function MARKETPLACE_ADD_SERVER(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketServers:1128425433076088892> ")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_SERVER");

  return button;
}

export function MARKETPLACE_ADD_VALUE_MONEY_VALUE(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_ADD_VALUE_MONEY_VALUE");

  return button;
}

export function MARKETPLACE_VIEW_NEXT_PAGE(): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel("🢂")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_VIEW_NEXT_PAGE");

  return button;
}

export function MARKETPLACE_VIEW_PREVIOUS_PAGE(): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel("🢀")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_VIEW_PREVIOUS_PAGE");

  return button;
}

export function MARKETPLACE_VIEW_HOME_PAGE(): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel("📰 Home")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("MARKETPLACE_VIEW_HOME_PAGE");

  return button;
}

export function MARKETPLACE_VIEW_FILTER(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("MARKETPLACE_VIEW_FILTER");

  return button;
}

export function MARKETPLACE_VIEW_FILTER_BY_NAME(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("MARKETPLACE_VIEW_FILTER_BY_NAME");

  return button;
}

export function MARKETPLACE_VIEW_FILTER_BY_SERVER(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("MARKETPLACE_VIEW_FILTER_BY_SERVER");

  return button;
}

export function MARKETPLACE_VIEW_FILTER_BY_EQUIPMENT(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("MARKETPLACE_VIEW_FILTER_BY_EQUIPMENT");

  return button;
}

export function MARKETPLACE_VIEW_FILTER_BY_PRICE(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("MARKETPLACE_VIEW_FILTER_BY_PRICE");

  return button;
}

export function MARKETPLACE_VIEW_SELECT(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakeleadd:1121534134259556402>")
    .setStyle(ButtonStyle.Success)
    .setCustomId("MARKETPLACE_VIEW_SELECT");

  return button;
}

export function MARKETPLACE_VIEW_HELP(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:kakelerules:1121534073899327568>")
    .setStyle(ButtonStyle.Link)
    .setURL("https://google.com");

  return button;
}

export function MARKETPLACE_VIEW_EXIT(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("MARKETPLACE_VIEW_EXIT");

  return button;
}

export function MARKETPLACE_VIEW_BACK(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("MARKETPLACE_VIEW_BACK");

  return button;
}

export function MARKETPLACE_VIEW_SELECT_ITEM_CHAT(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketChat:1128425366999015565>")
    .setStyle(ButtonStyle.Success)
    .setCustomId("MARKETPLACE_VIEW_SELECT_ITEM_CHAT");

  return button;
}

export function MARKETPLACE_VIEW_SELECT_ITEM_REPORT(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketWarn:1128425456866164736>")
    .setStyle(ButtonStyle.Danger)
    .setCustomId("MARKETPLACE_VIEW_SELECT_ITEM_REPORT");

  return button;
}

export function MARKETPLACE_VIEW_DM_USER_REPORT(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketWarn:1128425456866164736>")
    .setStyle(ButtonStyle.Danger)
    .setCustomId("MARKETPLACE_VIEW_DM_USER_REPORT");

  return button;
}

export function MARKETPLACE_VIEW_DM_USER_ANSWER(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketChat:1128425366999015565>")
    .setStyle(ButtonStyle.Success)
    .setCustomId("MARKETPLACE_VIEW_DM_USER_ANSWER");

  return button;
}

export function MARKETPLACE_VIEW_DM_FINISH(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setEmoji("<:marketStats:1128425449853308969>")
    .setStyle(ButtonStyle.Primary)
    .setCustomId("MARKETPLACE_VIEW_DM_FINISH");

  return button;
}

export function NOTIFICATION_BUTTON_MAINMENU_ADD(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("NOTIFICATION_BUTTON_MAINMENU_ADD");

  return button;
}

export function NOTIFICATION_BUTTON_MAINMENU_SETTINGS(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("NOTIFICATION_BUTTON_MAINMENU_SETTINGS");

  return button;
}

export function NOTIFICATION_BUTTON_MAINMENU_EXIT(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("NOTIFICATION_BUTTON_MAINMENU_EXIT");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_BACK(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_BACK");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_CLEAR_CHANNEL(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_CLEAR_CHANNEL");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_CLEAR_ROLE(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_CLEAR_ROLE");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX_ADD(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_CLEAR_INDEX_ADD");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_CLEAR_GUILD(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_CLEAR_GUILD");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_ADD_ID(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_ADD_ID");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_GENERIC_SERVER_SELECTION(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_GENERIC_SERVER_SELECTION");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_CONFIRM(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Success)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_CONFIRM");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_SETTINGS_BACK(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_SETTINGS_BACK");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_ROLE_SET_EVERYONE(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_ROLE_SET_EVERYONE");

  return button;
}

export function NOTIFICATION_BUTTON_EVENT_SETTINGS_CLEAR_EVERYONE(
  label: string,
): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("NOTIFICATION_BUTTON_EVENT_SETTINGS_CLEAR_EVERYONE");

  return button;
}

export function VIP_SETTINGS_BUTTON_ADD(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("VIP_SETTINGS_BUTTON_ADD");

  return button;
}

export function VIP_SETTINGS_BUTTON_REMOVE(label: string): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setCustomId("VIP_SETTINGS_BUTTON_REMOVE");

  return button;
}

export function JOIN_VIP_CONFIRM(): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel("Confirm")
    .setStyle(ButtonStyle.Success)
    .setCustomId("JOIN_VIP_CONFIRM");

  return button;
}

export function JOIN_VIP_REJECT(): ButtonBuilder {
  const button = new ButtonBuilder()
    .setLabel("Reject")
    .setStyle(ButtonStyle.Danger)
    .setCustomId("JOIN_VIP_REJECT");

  return button;
}
