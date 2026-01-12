import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient, Db } from 'mongodb';

// MongoDB connection singleton for Better Auth
let client: MongoClient | null = null;
let db: Db | null = null;

const getDB = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/save-our-votes';
  const dbName = process.env.MONGODB_DB_NAME || 'save-our-votes';

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(dbName);
  
  return db;
};

// Better Auth instance - initialized lazily on server
let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = async () => {
  if (authInstance) {
    return authInstance;
  }

  const database = await getDB();
  
  authInstance = betterAuth({
    database: mongodbAdapter(database, {
      client: client || undefined,
      transaction: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET || 'change-this-secret',
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    basePath: '/api/auth',
  });

  return authInstance;
};

// Export auth for client-side usage (will be initialized in API route)
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || 'change-this-secret',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  basePath: '/api/auth',
});
