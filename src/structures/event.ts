import { type ClientEvents } from "discord.js";
import type Biridim from "./client";

interface EventOptions<Key extends keyof ClientEvents> {
  name: Key;
  once: boolean;
  run: (client: Biridim, ...args: ClientEvents[Key]) => Promise<any> | any;
}

export default class DiscordEvent<Key extends keyof ClientEvents>
  implements EventOptions<Key>
{
  name: EventOptions<Key>["name"];
  once: EventOptions<Key>["once"];
  run: EventOptions<Key>["run"];

  constructor(options: EventOptions<Key>) {
    this.name = options.name;
    this.once = options.once;
    this.run = options.run;
  }
}
