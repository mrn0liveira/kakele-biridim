import { client, logger } from "../../index.ts";
import User from "../../database/schemas/user.ts";
import { CustomEmbed, sleep } from "../../misc/util/index.ts";
import type Biridim from "../../structures/client.ts";
import { SupportedLanguages } from "../../structures/misc.ts";
import cron from "node-cron";

export async function notifyExpiredVIP(client: Biridim): Promise<void> {
  const now = new Date();

  const users = await User.find({ "vip_data.expiration_date": { $lte: now } });

  if (users.length === 0) throw new Error("No users found in the database");

  for (const user of users) {
    const copy = { ...user.toObject() };

    delete copy.vip_data.expiration_date;
    await User.findOneAndReplace({ _id: user._id }, copy);

    const discordUser = await client.users.fetch(user.id);
    if (discordUser) {
      const language = user.language ?? SupportedLanguages.EN;
      const expirationDate = Math.floor(
        new Date(user.vip_data.expiration_date as Date).getTime() / 1000,
      );

      const embed = new CustomEmbed()
        .setTitle(
          client.translate("JOB_NOTIFY_EXPIRED_MESSAGE_TITLE", language),
        )
        .setDescription(
          client.translate("JOB_NOTIFY_EXPIRED_MESSAGE_DESCRIPTION", language, {
            date: `<t:${expirationDate}>`,
          }),
        )
        .setAuthor({
          name: "Kakele Biridim",
          iconURL: client.icons.ElderVampireBrooch,
        })
        .setColor(client.colors.GoldenRod);

      discordUser
        .send({ embeds: [embed] })
        .catch(() => {
          logger.error(
            "notifyExpiredVIP",
            `Could not send message to user ${user.id} at ${new Date()}`,
          );
        })
        .finally(() => {
          logger.audit(
            "notifyExpiredVIP",
            `Expired VIP ended for ${
              user.id
            } at ${new Date()} with ${expirationDate} as expiration date`,
          );
        });
    }

    await sleep(500);
  }
}

await (async (): Promise<void> => {
  cron.schedule("0 * * * *", async () => {
    await notifyExpiredVIP(client);
  });
})();
