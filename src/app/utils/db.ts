import Redis from 'ioredis';
import fs from 'fs';
import path from 'path';
import { isDev } from './db-config';

const DB_FILE = isDev ? 'bookings_test.json' : 'bookings.json';
const DB_PATH = path.join(process.cwd(), 'data', DB_FILE);
const KV_KEY = isDev ? 'bookings_test' : 'bookings';

// --- ioredis Client Initialization ---
let redis: Redis | null = null;
if (!isDev) {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
    if (redisUrl) {
        redis = new Redis(redisUrl, {
            tls: { rejectUnauthorized: false },
            connectTimeout: 10000,
        });
        redis.on('error', (err) => console.error('[Redis_Error]', err));
    }
}

// 🛡️ Quota Shield: In-Memory Cache (Server-Side)
let historyCache: any[] | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 30000; // 30 seconds

export const getBookings = async (): Promise<any[]> => {
    if (isDev) {
        if (!fs.existsSync(DB_PATH)) return [];
        try {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        } catch (e) {
            return [];
        }
    } else {
        // Production: Use ioredis
        try {
            // 🛡️ Quota Shield: Return cached data if fresh
            if (historyCache && (Date.now() - lastCacheUpdate < CACHE_TTL)) {
                return historyCache;
            }

            if (!redis) throw new Error("Redis client not initialized");

            const data = await redis.get(KV_KEY);
            const history = data ? JSON.parse(data) : [];

            // Update Cache
            historyCache = history;
            lastCacheUpdate = Date.now();

            console.log(`[REDIS_V1] Fetched ${history.length} records. (Reads saved by cache)`);
            return history;
        } catch (e) {
            console.error("[REDIS_V1] Fetch Error:", e);
            return historyCache || []; // Fallback to stale cache if Redis fails
        }
    }
};

export const saveBookings = async (bookings: any[]): Promise<void> => {
    // Safety: Only keep the latest 1000 items
    const cappedBookings = bookings.slice(0, 1000);

    if (isDev) {
        if (!fs.existsSync(path.dirname(DB_PATH))) {
            fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        }
        fs.writeFileSync(DB_PATH, JSON.stringify(cappedBookings, null, 2));
    } else {
        // Production: Use ioredis
        try {
            if (!redis) throw new Error("Redis client not initialized");

            // 🛡️ Quota Shield: Change Detection
            const current = await getBookings();
            if (current.length === cappedBookings.length &&
                JSON.stringify(current[0]?.id) === JSON.stringify(cappedBookings[0]?.id)) {
                console.log("[REDIS_V1] Write Skipped: No changes detected. (Quota Saved! 🛡️)");
                return;
            }

            await redis.set(KV_KEY, JSON.stringify(cappedBookings));

            // Invalidate cache on write
            historyCache = cappedBookings;
            lastCacheUpdate = Date.now();

            console.log("[REDIS_V1] Data Updated Successfully.");
        } catch (e) {
            console.error("[REDIS_V1] Save Error:", e);
        }
    }
};

export const clearHistory = async (): Promise<void> => {
    if (isDev) {
        if (fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
        }
    } else {
        try {
            if (!redis) throw new Error("Redis client not initialized");
            await redis.set(KV_KEY, JSON.stringify([]));
            historyCache = [];
            lastCacheUpdate = Date.now();
        } catch (e) {
            console.error("[REDIS_V1] Clear Error:", e);
        }
    }
};
