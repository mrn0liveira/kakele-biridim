import mongoose, {
  Schema,
  type Document,
  type Model,
  type PopulatedDoc,
} from "mongoose";
import { type IUser } from "./user";

export interface IGuildBlacklisted {
  reason: string;
  commands: string[];
  expiration_date: Date;
}

export interface IGuildBoostNotification {
  boosts: string[];
  channels: string;
  webhook: string;
  roles: string[];
  server: string;
}

export interface IGuildEventNotification {
  channel: string;
  events: number[];
  webhook: string;
  roles: string[];
  server: string;
}

export interface IGuildConfig {
  delete_message: string[];
  event_notification: IGuildEventNotification[];
  boost_notification: IGuildBoostNotification[];
}

export interface IGuildPayers {
  payers: Array<PopulatedDoc<IUser>>;
}

export interface IGuild extends Document {
  id: string;
  language?: string;
  blacklisted?: IGuildBlacklisted[];
  config: IGuildConfig;
  vip: IGuildPayers;
}

const guildSchema: Schema<IGuild> = new Schema<IGuild>({
  id: { type: String, required: true, unique: true },
  language: { type: String },
  blacklisted: [
    {
      reason: { type: String },
      commands: [{ type: String }],
      expiration_date: { type: Date },
    },
  ],
  config: {
    delete_message: { type: Array },
    event_notification: { type: Array },
    boost_notification: { type: Array },
  },
  vip: { payers: [{ type: Schema.Types.ObjectId, ref: "User" }] },
});

export const Guild: Model<IGuild> = mongoose.model<IGuild>(
  "Guild",
  guildSchema,
);
