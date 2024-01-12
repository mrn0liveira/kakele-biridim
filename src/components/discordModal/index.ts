import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import type Biridim from "../../structures/client";
import {
  type SupportedLanguages,
  type InteractionArgs,
} from "../../structures/misc";

export function MARKETPLACE_ADD_ITEM_MODAL(
  client: Biridim,
  args: InteractionArgs,
): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("MARKETPLACE_ADD_ITEM_MODAL")
    .setTitle(
      client.translate("MARKETPLACE_ADD_ITEM_MODAL_TITLE", args.language),
    )
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel(
            client.translate(
              "MARKETPLACE_ADD_ITEM_MODAL_INPUT_LABEL",
              args.language,
            ),
          )
          .setCustomId("input")
          .setMaxLength(50)
          .setRequired(true)
          .setStyle(TextInputStyle.Short),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel(
            client.translate(
              "MARKETPLACE_ADD_ITEM_MODAL_AMOUNT_LABEL",
              args.language,
            ),
          )
          .setCustomId("amount")
          .setMaxLength(5)
          .setRequired(false)
          .setStyle(TextInputStyle.Short),
      ),
    );
  return modal;
}

export function MARKETPLACE_ADD_STATS_MODAL(
  client: Biridim,
  args: InteractionArgs,
): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("MARKETPLACE_ADD_STATS_MODAL")
    .setTitle(
      client.translate("MARKETPLACE_ADD_STATS_MODAL_TITLE", args.language),
    )
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel(
            client.translate(
              "MARKETPLACE_ADD_STATS_MODAL_INPUT_LABEL",
              args.language,
            ),
          )
          .setCustomId("input")
          .setMaxLength(3)
          .setRequired(true)
          .setStyle(TextInputStyle.Short),
      ),
    );
  return modal;
}

export function MARKETPLACE_ADD_PRICE_MODAL(
  client: Biridim,
  args: InteractionArgs,
): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("MARKETPLACE_ADD_PRICE_MODAL")
    .setTitle(
      client.translate("MARKETPLACE_ADD_PRICE_MODAL_TITLE", args.language),
    )
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel(
            client.translate(
              "MARKETPLACE_ADD_PRICE_MODAL_INPUT_LABEL",
              args.language,
            ),
          )
          .setCustomId("input")
          .setMaxLength(12)
          .setRequired(true)
          .setStyle(TextInputStyle.Short),
      ),
    );
  return modal;
}

export function MARKETPLACE_VIEW_REPORT_MODAL(
  client: Biridim,
  language: SupportedLanguages,
): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("MARKETPLACE_VIEW_REPORT_MODAL")
    .setTitle(client.translate("MARKETPLACE_VIEW_REPORT_MODAL_TITLE", language))
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel(
            client.translate(
              "MARKETPLACE_VIEW_REPORT_MODAL_INPUT_LABEL",
              language,
            ),
          )
          .setCustomId("input")
          .setMinLength(16)
          .setMaxLength(128)
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph),
      ),
    );
  return modal;
}

export function MARKETPLACE_VIEW_MESSAGE_MODAL(
  client: Biridim,
  language: SupportedLanguages,
): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("MARKETPLACE_VIEW_MESSAGE_MODAL")
    .setTitle(
      client.translate("MARKETPLACE_VIEW_MESSAGE_MODAL_TITLE", language),
    )
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel(
            client.translate(
              "MARKETPLACE_VIEW_MESSAGE_MODAL_INPUT_LABEL",
              language,
            ),
          )
          .setCustomId("input")
          .setMinLength(16)
          .setMaxLength(128)
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph),
      ),
    );
  return modal;
}

export function MARKETPLACE_VIEW_ANSWER_MODAL(
  client: Biridim,
  language: SupportedLanguages,
): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("MARKETPLACE_VIEW_ANSWER_MODAL")
    .setTitle(client.translate("MARKETPLACE_VIEW_ANSWER_MODAL_TITLE", language))
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel(
            client.translate(
              "MARKETPLACE_VIEW_MESSAGE_MODAL_INPUT_LABEL",
              language,
            ),
          )
          .setCustomId("input")
          .setMinLength(16)
          .setMaxLength(128)
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph),
      ),
    );
  return modal;
}

export function NOTIFICATION_MODAL_EVENT_INDEX_SELECTION(
  client: Biridim,
  language: SupportedLanguages,
): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("NOTIFICATION_MODAL_EVENT_INDEX_SELECTION")
    .setTitle(client.translate("MODAL_INDEX_SELECTION_TITLE", language))
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel(
            client.translate("MODAL_INDEX_SELECTION_TEXT_IMPUT", language),
          )
          .setCustomId("index")
          .setMaxLength(3)
          .setRequired(true)
          .setStyle(TextInputStyle.Short),
      ),
    );
  return modal;
}
export function JOIN_VIP_CONFIRM_MODAL(
  client: Biridim,
  language: SupportedLanguages,
): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("JOIN_VIP_CONFIRM_MODAL")
    .setTitle(client.translate("JOIN_VIP_CONFIRM_MODAL_TITLE", language))
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel(client.translate("JOIN_VIP_CONFIRM_MODAL_LABEL", language))
          .setCustomId("coins")
          .setMaxLength(4)
          .setRequired(true)
          .setStyle(TextInputStyle.Short),
      ),
    );
  return modal;
}

export function JOIN_VIP_REJECT_MODAL(
  client: Biridim,
  language: SupportedLanguages,
): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("JOIN_VIP_REJECT_MODAL")
    .setTitle(client.translate("JOIN_VIP_REJECT_MODAL_TITLE", language))
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel(client.translate("JOIN_VIP_REJECT_MODAL_LABEL", language))
          .setCustomId("reason")
          .setMaxLength(256)
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph),
      ),
    );
  return modal;
}
