import {
  type ModalSubmitInteraction,
  type ButtonInteraction,
  ActionRowBuilder,
  type ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type Biridim from "../../structures/client.ts";
import { SupportedLanguages } from "../../structures/misc.ts";
import {
  JOIN_VIP_CONFIRM_MODAL,
  JOIN_VIP_REJECT_MODAL,
} from "../../components/discordModal/index.ts";
import { CustomEmbed, calculatePremiumDays } from "../util/index.ts";
import { logger } from "../../index.ts";
import {
  JOIN_VIP_CONFIRM,
  JOIN_VIP_REJECT,
} from "../../components/discordButton/index.ts";
import User from "../../database/schemas/user.ts";
import { getUser } from "../database/index.ts";

async function showConfirmModal(
  client: Biridim,
  interaction: ButtonInteraction,
  language: SupportedLanguages,
): Promise<void> {
  await interaction.showModal(JOIN_VIP_CONFIRM_MODAL(client, language));
}

async function showRejectModal(
  client: Biridim,
  interaction: ButtonInteraction,
  language: SupportedLanguages,
): Promise<void> {
  await interaction.showModal(JOIN_VIP_REJECT_MODAL(client, language));
}

async function handleConfirmModal(
  client: Biridim,
  interaction: ModalSubmitInteraction,
): Promise<void> {
  if (!interaction.deferred) {
    await interaction.deferUpdate();
  }

  const coins = Number(interaction.fields.getTextInputValue("coins"));

  const userID = interaction.message?.embeds[0].data?.footer?.text;

  const user = await User.findOne({ id: userID });

  const now = new Date();

  if (Number.isNaN(coins)) {
    await interaction.followUp({ content: "Invalid number", ephemeral: true });
    return;
  }

  if (user == null) {
    await interaction.followUp({ content: "Invalid UserID", ephemeral: true });
    return;
  }

  try {
    const vipExpiration = user.vip_data.expiration_date ?? 0;
    const expirationDate = now > vipExpiration ? now : new Date(vipExpiration);

    const result = calculatePremiumDays(expirationDate, coins);

    user.vip_data.expiration_date = result.premiumExpiration;

    const userLanguage =
      SupportedLanguages[user.language ?? ""] ?? SupportedLanguages.EN;

    await user.save();

    await client.sendMessageToUser(user.id, {
      embeds: [
        new CustomEmbed()
          .setTitle(
            client.translate("COMMAND_JOIN_VIP_DM_MESSAGE_TITLE", userLanguage),
          )
          .setDescription(
            client.translate(
              "COMMAND_JOIN_VIP_DM_MESSAGE_DESCRIPTION",
              userLanguage,
              {
                date: `<t:${Math.floor(
                  result.premiumExpiration.getTime() / 1000,
                )}>`,
              },
            ),
          )
          .setAuthor({
            name: "Kakele Biridim",
            iconURL: client.icons.BlazefuryTome,
          })
          .setColor(client.colors.GoldenRod),
      ],
    });
  } catch (error) {
    logger.error("handleConfirmModal", "sendMessageToUser", error);

    await interaction.followUp({
      content: "Failed to send message to user",
      ephemeral: true,
    });
  }

  await interaction.editReply({
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(JOIN_VIP_CONFIRM().setStyle(ButtonStyle.Secondary))
        .addComponents(JOIN_VIP_REJECT().setStyle(ButtonStyle.Secondary)),
    ],
  });
}

async function handleRejectModal(
  client: Biridim,
  interaction: ModalSubmitInteraction,
): Promise<void> {
  if (!interaction.deferred) {
    await interaction.deferUpdate();
  }

  const reason = interaction.fields.getTextInputValue("reason");

  const userID = interaction.message?.embeds[0].data.footer?.text;

  if (userID === undefined) {
    await interaction.followUp({ content: "Invalid UserID", ephemeral: true });
    return;
  }

  const user = await getUser(userID);

  await client.sendMessageToUser(user.id, {
    embeds: [
      new CustomEmbed()
        .setTitle(
          client.translate(
            "COMMAND_JOIN_VIP_DM_REJECT_MESSAGE_TITLE",
            SupportedLanguages[user.language ?? ""] ?? SupportedLanguages.EN,
          ),
        )
        .setDescription(
          client.translate(
            "COMMAND_JOIN_VIP_DM_REJECT_MESSAGE_DESCRIPTION",
            SupportedLanguages[user.language ?? ""] ?? SupportedLanguages.EN,
            { reason },
          ),
        )
        .setAuthor({
          name: "Kakele Biridim",
          iconURL: client.icons.BlazefuryTome,
        })
        .setColor(client.colors.DarkRed),
    ],
  });

  await interaction.editReply({
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(JOIN_VIP_CONFIRM().setStyle(ButtonStyle.Secondary))
        .addComponents(JOIN_VIP_REJECT().setStyle(ButtonStyle.Secondary)),
    ],
  });
}

export {
  showConfirmModal,
  showRejectModal,
  handleConfirmModal,
  handleRejectModal,
};
