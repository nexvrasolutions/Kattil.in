import dns from "dns";
import mongoose from "mongoose";

// Ensure public DNS resolvers are used to prevent querySrv ECONNREFUSED issues on local DNS proxies
function setupDns() {
  try {
    if (typeof (dns as any).setDefaultResultOrder === "function") {
      (dns as any).setDefaultResultOrder("ipv4first");
    }
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  } catch {}
}

setupDns();

interface MongooseCache {
  uri: string;
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

/**
 * Resolves mongodb+srv:// URIs to standard direct replica set URIs
 * if DNS SRV queries fail on local DNS resolvers.
 */
async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  setupDns();

  try {
    const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
    if (!match) return uri;

    const [, user, pass, host, path = "", query = ""] = match;

    const srvRecords = await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
    if (!srvRecords || srvRecords.length === 0) return uri;

    let txtParams = "";
    try {
      const txtRecords = await dns.promises.resolveTxt(host);
      if (txtRecords && txtRecords.length > 0) {
        txtParams = txtRecords.flat().join("&");
      }
    } catch {}

    const hostList = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
    const existingParams = query.replace(/^\?/, "");
    const combinedParams = [
      "ssl=true",
      txtParams,
      existingParams,
    ].filter(Boolean).join("&");

    const decodedUser = decodeURIComponent(user);
    const decodedPass = decodeURIComponent(pass);

    return `mongodb://${encodeURIComponent(decodedUser)}:${encodeURIComponent(decodedPass)}@${hostList}${path}?${combinedParams}`;
  } catch {
    return uri;
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  setupDns();

  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) throw new Error("MONGODB_URI environment variable is not defined");

  // Discard stale cache when the URI changes
  if (global._mongooseCache && global._mongooseCache.uri !== rawUri) {
    try { await mongoose.disconnect(); } catch { /* ignore */ }
    global._mongooseCache = undefined;
  }

  if (!global._mongooseCache) {
    global._mongooseCache = { uri: rawUri, conn: null, promise: null };
  }

  const cached = global._mongooseCache;

  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  if (!cached.promise || mongoose.connection.readyState === 0) {
    cached.promise = (async () => {
      const targetUri = await resolveMongoUri(rawUri);

      return mongoose.connect(targetUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 30000,
      });
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
