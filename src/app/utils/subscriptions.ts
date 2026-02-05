import Redis from 'ioredis';
import { isDev } from './db-config';

interface LocationSubscription {
    location: string;
    subscription: any;
    timestamp: string;
}

// Memory fallback for development
let memorySubscriptions: LocationSubscription[] = [];
const KV_SUBS_KEY = isDev ? 'push_subscriptions_test' : 'push_subscriptions';

// --- Redis Client (Same instance as db.ts for performance) ---
let redis: Redis | null = null;
if (!isDev) {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
    if (redisUrl) {
        redis = new Redis(redisUrl, {
            tls: { rejectUnauthorized: false },
            connectTimeout: 10000,
        });
    }
}

export const saveSubscription = async (location: string, subscription: any) => {
    const newSub: LocationSubscription = {
        location,
        subscription,
        timestamp: new Date().toISOString()
    };

    if (isDev) {
        // Remove existing for this subscription if exists
        memorySubscriptions = memorySubscriptions.filter(s =>
            JSON.stringify(s.subscription) !== JSON.stringify(subscription)
        );
        memorySubscriptions.push(newSub);
    } else {
        // Production: Save to Redis
        try {
            if (!redis) throw new Error("Redis not initialized");
            const current = await getSubscriptions();
            const filtered = current.filter(s =>
                JSON.stringify(s.subscription) !== JSON.stringify(subscription)
            );
            filtered.push(newSub);
            await redis.set(KV_SUBS_KEY, JSON.stringify(filtered));
        } catch (e) {
            console.error('Redis Subscription Save Error:', e);
        }
    }
};

export const getSubscriptions = async (): Promise<LocationSubscription[]> => {
    if (isDev) {
        return memorySubscriptions;
    } else {
        try {
            if (!redis) throw new Error("Redis not initialized");
            const data = await redis.get(KV_SUBS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Redis Subscription Fetch Error:', e);
            return [];
        }
    }
};
