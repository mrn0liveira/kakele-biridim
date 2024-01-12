import mongoose, { type Document, Schema } from "mongoose";

export interface IEvent extends Document {
  id: string;
  language: Record<string, string>;
  timestamp: string;
  active_until: string;
  activation_enabled_unix_seconds: string;
  server: string;
}

const eventSchema: Schema<IEvent> = new Schema<IEvent>({
  id: { type: String },
  language: { type: Object },
  timestamp: { type: String },
  active_until: { type: String },
  activation_enabled_unix_seconds: { type: String },
  server: { type: String },
});

export default mongoose.model<IEvent>("Event", eventSchema);
