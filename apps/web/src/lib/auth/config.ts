import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient, Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var __betterAuthInstance: ReturnType<typeof betterAuth> | undefined;
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var __mongoDb: Db | undefined;
}

const getDB = async (): Promise<Db> => {
  if (global.__mongoDb) {
    return global.__mongoDb;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/save-our-votes';
  const dbName = process.env.MONGODB_DB_NAME || 'save-our-votes';

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);
  
  global.__mongoClient = client;
  global.__mongoDb = db;
  
  return db;
};

export const getAuth = async () => {
  if (global.__betterAuthInstance) {
    return global.__betterAuthInstance;
  }

  const database = await getDB();
  
  const authInstance = betterAuth({
    database: mongodbAdapter(database, {
      client: global.__mongoClient || undefined,
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET || 'change-this-secret',
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    basePath: '/api/auth',
  });

  global.__betterAuthInstance = authInstance;

  return authInstance;
};
