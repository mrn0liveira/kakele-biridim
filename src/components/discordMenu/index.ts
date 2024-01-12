import {
  ChannelSelectMenuBuilder,
  ChannelType,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import type Biridim from "../../structures/client.ts";
import { type IOfferItemDocument } from "../../database/schemas/marketplace-item.ts";
import {
  type KakeleMonster,
  type CharacterData,
  type SupportedLanguagesString,
  type KakeleItem,
  SupportedLanguages,
} from "../../structures/misc.ts";
import { capitalizeFirstLetter, getLevel } from "../../misc/util/index.ts";
import { KAKELE_BOOST_NAMES } from "../../misc/constants/index.ts";

export function PLAYER_RESULT_SELECTION_MENU(
  data: Array<{ item: CharacterData }>,
): StringSelectMenuBuilder {
  const options: StringSelectMenuOptionBuilder[] = [];

  data.forEach((option, index) => {
    options.push(
      new StringSelectMenuOptionBuilder()
        .setValue(String(index))
        .setLabel(option.item.name)
        .setDescription(
          `${getLevel(Number(option.item.experience))} ${capitalizeFirstLetter(
            data[index].item.vocation.toLowerCase(),
          )} | ${capitalizeFirstLetter(option.item.server ?? "")}`,
        ),
    );
  });

  const menu = new StringSelectMenuBuilder()
    .setCustomId("PLAYER_RESULT_SELECTION_MENU")
    .setPlaceholder("...")
    .addOptions(options);

  return menu;
}

export function MONSTER_RESULT_SELECTION_MENU(
  data: Array<{ item: KakeleMonster }>,
  languageKey: string,
): StringSelectMenuBuilder {
  const options: StringSelectMenuOptionBuilder[] = [];
  data.forEach((option, index) => {
    options.push(
      new StringSelectMenuOptionBuilder()
        .setValue(String(index))
        .setLabel(option.item[languageKey]),
    );
  });

  const menu = new StringSelectMenuBuilder()
    .setCustomId("MONSTER_RESULT_SELECTION_MENU")
    .setPlaceholder("...")
    .addOptions(options);

  return menu;
}

export function ITEM_RESULT_SELECTION_MENU(
  data: Array<{ item: KakeleItem }>,
  language: SupportedLanguagesString,
): StringSelectMenuBuilder {
  const options: StringSelectMenuOptionBuilder[] = [];
  data.forEach((option, index) => {
    options.push(
      new StringSelectMenuOptionBuilder()
        .setValue(String(index))
        .setLabel(option.item.name[language]),
    );
  });

  const menu = new StringSelectMenuBuilder()
    .setCustomId("ITEM_RESULT_SELECTION_MENU")
    .setPlaceholder("...")
    .addOptions(options);

  return menu;
}

export function MARKETPLACE_ADD_RESULT_SELECTION_MENU(
  client: Biridim,
  items: any[],
  language: string,
): StringSelectMenuBuilder {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("MARKETPLACE_ADD_RESULT_SELECTION_MENU")
    .setPlaceholder("...");

  const options: StringSelectMenuOptionBuilder[] = [];

  items.forEach((item) => {
    const emoji = client.kakeleEmojis.find(
      (x) => x.name === item.name.english.replace(/[^A-Z0-9]/gi, ""),
    );

    options.push(
      new StringSelectMenuOptionBuilder()
        .setValue(item.name[language])
        .setLabel(item.name[language])
        .setEmoji(emoji != null ? { name: emoji.name, id: emoji.id } : {}),
    );
  });

  menu.addOptions(options);

  return menu;
}

export function MARKETPLACE_VIEW_SELECTION_MENU(
  items: IOfferItemDocument[],
): StringSelectMenuBuilder {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("MARKETPLACE_VIEW_SELECTION_MENU")
    .setPlaceholder("...");

  const options: StringSelectMenuOptionBuilder[] = [];

  items.forEach((item) => {
    options.push(
      new StringSelectMenuOptionBuilder()
        .setValue(item._id.toHexString())
        .setLabel(`${item.amount}x ${item.item.name}`)
        .setDescription(item._id.toHexString()),
    );
  });

  menu.addOptions(options);

  return menu;
}

export function GENERIC_SERVER_SELECTION(): StringSelectMenuBuilder {
  return new StringSelectMenuBuilder()
    .setCustomId("GENERIC_SERVER_SELECTION")
    .setPlaceholder("...")
    .addOptions(
      {
        label: "South America Red",
        value: "red",
        emoji: {
          id: "1096093705116586154",
          name: "redScroll",
        },
      },
      {
        label: "South America Blue",
        value: "blue",
        emoji: {
          id: "1096093678205935687",
          name: "blueScroll",
        },
      },
      {
        label: "South America Pink",
        value: "pink",
        emoji: {
          id: "1096093696757354566",
          name: "pinkScroll",
        },
      },
      {
        label: "South America Yellow",
        value: "yellow",
        emoji: {
          id: "1096093819222622219",
          name: "whiteScroll",
        },
      },
      {
        label: "North America Lime",
        value: "lime",
        emoji: {
          id: "1096093687328542812",
          name: "limeScroll",
        },
      },
      {
        label: "North America Violet",
        value: "violet",
        emoji: {
          id: "1096093709411565649",
          name: "violetScroll",
        },
      },
      {
        label: "Southeast Asia White",
        value: "white",
        emoji: {
          id: "1096093819222622219",
          name: "whiteScroll",
        },
      },
      {
        label: "Europe Green",
        value: "green",
        emoji: {
          id: "1096093682647707668",
          name: "greenScroll",
        },
      },
      {
        label: "Europe Orange",
        value: "orange",
        emoji: {
          id: "1096093692001013843",
          name: "orangeScroll",
        },
      },
      {
        label: "Europe Gold",
        value: "gold",
        emoji: {
          id: "1096093692001013843",
          name: "orangeScroll",
        },
      },
    );
}

export function CURRENCY_SELECTION(): StringSelectMenuBuilder {
  return new StringSelectMenuBuilder()
    .setCustomId("CURRENCY_SELECTION")
    .setPlaceholder("..")
    .addOptions(
      {
        label: "Dollar",
        value: "usd",
      },
      {
        label: "Real",
        value: "brl",
      },
      {
        label: "Peso",
        value: "peso",
      },
      {
        label: "Euro",
        value: "eur",
      },
    );
}

export function NOTIFICATION_MENU_EVENT_CHANNEL_SELECTION(): ChannelSelectMenuBuilder {
  return new ChannelSelectMenuBuilder({
    custom_id: "NOTIFICATION_MENU_EVENT_CHANNEL_SELECTION",
    placeholder: "...",
  })
    .setChannelTypes([ChannelType.GuildText])
    .setMinValues(1);
}

export function NOTIFICATION_MENU_EVENT_SETTINGS_CHANNEL_SELECTION(): ChannelSelectMenuBuilder {
  return new ChannelSelectMenuBuilder({
    custom_id: "NOTIFICATION_MENU_EVENT_SETTINGS_CHANNEL_SELECTION",
    placeholder: "...",
  })
    .setChannelTypes([ChannelType.GuildText])
    .setMinValues(1);
}

export function NOTIFICATION_MENU_EVENT_ROLE_SELECTION(): RoleSelectMenuBuilder {
  return new RoleSelectMenuBuilder({
    custom_id: "NOTIFICATION_MENU_EVENT_ROLE_SELECTION",
    placeholder: "...",
  })
    .setMinValues(1)
    .setMaxValues(5);
}

export function NOTIFICATION_MENU_EVENT_SETTINGS_ROLE_SELECTION(): RoleSelectMenuBuilder {
  return new RoleSelectMenuBuilder({
    custom_id: "NOTIFICATION_MENU_EVENT_SETTINGS_ROLE_SELECTION",
    placeholder: "...",
  })
    .setMinValues(1)
    .setMaxValues(5);
}

export function NOTIFICATION_MENU_BOOST_SELECTION(
  language: SupportedLanguages,
): StringSelectMenuBuilder {
  return new StringSelectMenuBuilder()
    .setCustomId("NOTIFICATION_MENU_BOOST_SELECTION")
    .setPlaceholder("...")
    .addOptions(
      {
        label: KAKELE_BOOST_NAMES.ATTACK_ARMOR_SPELL_POWER_10_PERCENT[language],
        value: "ATTACK_ARMOR_SPELL_POWER_10_PERCENT",
      },
      {
        label: KAKELE_BOOST_NAMES.FOOD_POWER_25_PERCENT[language],
        value: "FOOD_POWER_25_PERCENT",
      },
      {
        label: KAKELE_BOOST_NAMES.LOOT_AND_GOLD_TWICE_MORE[language],
        value: "LOOT_AND_GOLD_TWICE_MORE",
      },
      {
        label: KAKELE_BOOST_NAMES.GOLDEN_MONSTER_CHANCE_TWICE_MORE[language],
        value: "GOLDEN_MONSTER_CHANCE_TWICE_MORE",
      },
      {
        label: KAKELE_BOOST_NAMES.MAP_EVENTS_2_TIMES[language],
        value: "MAP_EVENTS_2_TIMES",
      },
      {
        label: KAKELE_BOOST_NAMES.EXPERIENCE_30_PERCENT[language],
        value: "EXPERIENCE_30_PERCENT",
      },
      {
        label: KAKELE_BOOST_NAMES.PET_SKILLS_2_TIMES[language],
        value: "PET_SKILLS_2_TIMES",
      },
      {
        label: KAKELE_BOOST_NAMES.ACTIVATE_BESTIARY[language],
        value: "ACTIVATE_BESTIARY",
      },
    )
    .setMinValues(1)
    .setMaxValues(7);
}
