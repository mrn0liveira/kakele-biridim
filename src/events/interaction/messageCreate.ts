import { Events, codeBlock } from "discord.js";
import DiscordEvent from "../../structures/event.ts";
import { getGuild } from "../../misc/database/index.ts";
import "dotenv/config";

const owners = process.env.OWNER;

function isValidNumber(value: number | string) {
  return (
    !isNaN(Number(value)) &&
    Number.isInteger(Number(value)) &&
    Number(value) >= 0
  );
}

function addTimeToTimestamp(timestamp, hours, days, minutes) {
  const newTimestamp = new Date(timestamp);

  if (isValidNumber(hours)) {
    newTimestamp.setHours(newTimestamp.getHours() + parseInt(hours, 10));
  }

  if (isValidNumber(days)) {
    newTimestamp.setDate(newTimestamp.getDate() + parseInt(days, 10));
  }

  if (isValidNumber(minutes)) {
    newTimestamp.setMinutes(newTimestamp.getMinutes() + parseInt(minutes, 10));
  }

  return newTimestamp.getTime();
}

async function evalAsync(code: string): Promise<any> {
  return await new Promise((resolve, reject) => {
    try {
      const result = eval(code);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

async function deleteMessage(message): Promise<void> {
  try {
    await message.delete();
  } catch (error) {
    console.error("Error while deleting the message:", error);
  }
}

function formatResult(result: any): string {
  if (typeof result === "object") {
    return codeBlock("js", JSON.stringify(result, null, 2).slice(0, 1894));
  }
  return String(result);
}

function addToBlacklist(name) {
  if (global.rankingBlacklist === undefined) {
    global.rankingBlacklist = [];
  }
  if (!global.rankingBlacklist.includes(name)) {
    global.rankingBlacklist.push(name);
  }
}

function clearBlacklist() {
  global.rankingBlacklist = [];
}

export default new DiscordEvent({
  name: Events.MessageCreate,
  once: false,
  async run(client, message) {
    if (message.author.bot) return;

    const isOwner: boolean = owners?.includes(message.author.id) ?? false;

    const args = message.content.trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (message.guildId != null) {
      const guild = await getGuild(message.guildId);

      if (guild.config.delete_message.includes(message.channelId)) {
        message.delete().catch(() => {});
      }
    }

    if (isOwner) {
      if (command === ".blacklist-add") {
        if (args.length === 0) {
          message.reply("Please provide a name to add to the blacklist.");
          return;
        }

        const nameToAdd = args.join(" ");

        addToBlacklist(nameToAdd);
        message.reply("The Nickname has been added to the blacklist.");
      }
      if (command === ".blacklist-clear") {
        clearBlacklist();
        message.reply("The blacklist has been cleared.");
      }
      if (command === "..exec") {
        if (args.length === 0) {
          await message.reply("Please provide code to evaluate.");
          return;
        }

        let silent = false;
        let shouldDelete = false;

        const cleanedArgs = args.filter((arg) => {
          if (arg === "-s") {
            silent = true;
            return false;
          } else if (arg === "-d") {
            shouldDelete = true;
            return false;
          }
          return true;
        });

        const code = cleanedArgs.join(" ");

        try {
          let result;

          if (code.includes("await")) {
            const asyncFunction = `(async () => { ${code} })()`;
            result = await evalAsync(asyncFunction);
          } else {
            result = eval(code);
          }

          if (!silent) {
            const formattedResult = formatResult(result);

            if (shouldDelete) {
              void message.channel.send(formattedResult);
              void deleteMessage(message);
            } else {
              await message.reply(formattedResult);
            }
          }
        } catch (error) {
          if (!silent) {
            await message.reply(`Error: ${String(error.message)}`);
          }
        } finally {
          if (shouldDelete && !silent) {
            void deleteMessage(message);
          }
        }
      } else if (command === "..reload") {
        if (args.length === 0) {
          await message.reply(
            "Please provide the name of the command to reload.",
          );
          return;
        }

        const commandName = args[0].toLowerCase();

        try {
          await client.reloadInteractionCommand(commandName, true);

          await message.reply(formatResult("Command reloaded"));
        } catch (error) {
          await message.reply(`Error: ${String(error.message)}`);
        }
      }
    }
    if (command === "..timestamp") {
      let hours = 0;
      let days = 0;
      let minutes = 0;

      for (const arg of args) {
        if (arg.endsWith("h") && isValidNumber(arg.slice(0, -1))) {
          hours = Number(arg.slice(0, -1));
        } else if (arg.endsWith("d") && isValidNumber(arg.slice(0, -1))) {
          days = Number(arg.slice(0, -1));
        } else if (arg.endsWith("m") && isValidNumber(arg.slice(0, -1))) {
          minutes = Number(arg.slice(0, -1));
        }
      }

      try {
        await message.delete();
      } catch (error) {}

      const timestamp = new Date();

      const adjustedTimestamp = Math.round(
        addTimeToTimestamp(timestamp, hours, days, minutes) / 1000,
      );

      const responseMessage = `<t:${adjustedTimestamp}:R> (<t:${adjustedTimestamp}:f>)`;
      await message.channel.send(responseMessage);
    }
  },
});
