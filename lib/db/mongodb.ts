import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

interface MongooseCache {
  uri: string;
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error("MONGODB_URI environment variable is not defined");

  // Discard stale cache when the URI changes (e.g. after .env.local edit)
  if (global._mongooseCache && global._mongooseCache.uri !== MONGODB_URI) {
    try { await mongoose.disconnect(); } catch { /* ignore */ }
    global._mongooseCache = undefined;
  }

  if (!global._mongooseCache) {
    global._mongooseCache = { uri: MONGODB_URI, conn: null, promise: null };
  }

  const cached = global._mongooseCache;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 15000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
