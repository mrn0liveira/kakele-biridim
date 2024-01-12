import "dotenv/config";
import mongo, { type ConnectOptions } from "mongoose";

import cachegoose from "recachegoose";

export async function createMongoConnection(): Promise<void> {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  cachegoose(mongo, {
    engine: "memory",
  });

  await mongo.connect(
    process.env.DISCORD_MONGODB_URL as string,
    options as ConnectOptions,
  );
}

await createMongoConnection();

export default mongo;
