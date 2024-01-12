import {
  Schema,
  type Document,
  type Model,
  model,
  type Types,
  type PopulatedDoc,
} from "mongoose";
import { type IUser } from "./user";

export interface IMarketplaceItemStats {
  magic: number;
  attack: number;
  armor: number;
  bless: number;
}

export interface IMarketplaceItemPrice {
  gold: number;
  coins: number;
  money: {
    currency: string;
    amount: number;
  };
}

export interface IMarketplaceItem {
  name: string;
  stats?: IMarketplaceItemStats;
  price: IMarketplaceItemPrice;
}

export interface IMarketplaceChat {
  _id?: Types.ObjectId;
  id: string;
  pseudonym: string;
  messages: Array<{ author: string; content: string }>;
}

export interface IOfferItemDocument extends Document {
  _id: Types.ObjectId;
  owner: PopulatedDoc<IUser>;
  posted_date: Date;
  expiration_date?: Date;
  servers: string[];
  chats: IMarketplaceChat[];
  amount: number;
  item: IMarketplaceItem;
}

const OfferItemSchema: Schema<IOfferItemDocument> =
  new Schema<IOfferItemDocument>({
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    posted_date: { type: Date, required: true },
    expiration_date: { type: Date, default: Date.now },
    servers: { type: [String], default: [] },
    chats: [
      {
        id: { type: String },
        pseudonym: { type: String },
        messages: [
          {
            author: { type: String },
            content: { type: String },
          },
        ],
      },
    ],
    amount: { type: Number, default: 1 },
    item: {
      name: { type: String, required: true },
      stats: {
        magic: { type: Number },
        attack: { type: Number },
        armor: { type: Number },
        bless: { type: Number },
      },
      price: {
        gold: { type: Number },
        coins: { type: Number },
        money: {
          currency: { type: String },
          amount: { type: Number },
        },
      },
    },
  });

export const MarketplaceItem: Model<IOfferItemDocument> =
  model<IOfferItemDocument>("OfferItem", OfferItemSchema);
