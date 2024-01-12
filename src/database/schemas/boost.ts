import mongoose, { type Document, Schema } from "mongoose";

export interface IBoost extends Document {
  id: string;
  timestamp: string;
  active_until: string;
  server: string;
}

const boostSchema: Schema<IBoost> = new Schema<IBoost>({
  id: { type: String },
  timestamp: { type: String },
  active_until: { type: String },
  server: { type: String },
});

export default mongoose.model<IBoost>("Boost", boostSchema);
