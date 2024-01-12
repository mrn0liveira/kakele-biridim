import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IUserBlacklisted {
  reason: string;
  commands: string[];
  expiration_date: Date;
}

export interface IUserVipData {
  history: string[];
  expiration_date?: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  id: string;
  language?: string;
  blacklisted?: IUserBlacklisted[];
  vip_data: IUserVipData;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  language: { type: String },
  blacklisted: [
    {
      reason: { type: String },
      commands: [{ type: String }],
      expiration_date: { type: Date },
    },
  ],
  vip_data: {
    history: [{ type: String }],
    expiration_date: { type: Date },
  },
});

export default mongoose.model<IUser>("User", userSchema);
