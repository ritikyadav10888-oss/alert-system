import Redis from 'ioredis';
import { isDev } from './db-config';
import fs from 'fs';
import path from 'path';

interface LocationSubscription {
    location: string;
    subscription: any;
    timestamp: string;
}

// Memory fallback for development
const SUBS_FILE = path.join(process.cwd(), 'data', 'subscriptions_test.json');

const REDIS_SUBS_KEY = isDev ? 'push_subscriptions_test' : 'push_subscriptions';

// Singleton Redis Client matching db.ts logic
let redis: Redis | null = null;
const getRedisClient = () => {
    if (isDev) return null;
    if (!redis) {
        const url = process.env.REDIS_URL || process.env.KV_URL || '';
        if (url) {
            // Validation: ioredis needs redis:// or rediss://
            if (url.startsWith('https://')) return null;

            redis = new Redis(url, {
                tls: { rejectUnauthorized: false },
                maxRetriesPerRequest: 3,
                connectTimeout: 10000
            });
        }
    }
    return redis;
};

export const saveSubscription = async (location: string, subscription: any) => {
    const newSub: LocationSubscription = {
        location,
        subscription,
        timestamp: new Date().toISOString()
    };

    if (isDev) {
        const current = await getSubscriptions();
        const filtered = current.filter(s =>
            JSON.stringify(s.subscription) !== JSON.stringify(subscription)
        );
        filtered.push(newSub);

        if (!fs.existsSync(path.dirname(SUBS_FILE))) {
            fs.mkdirSync(path.dirname(SUBS_FILE), { recursive: true });
        }
        fs.writeFileSync(SUBS_FILE, JSON.stringify(filtered, null, 2));
    } else {
        try {
            const client = getRedisClient();
            if (!client) return;
            const current = await getSubscriptions();
            const filtered = current.filter(s =>
                JSON.stringify(s.subscription) !== JSON.stringify(subscription)
            );
            filtered.push(newSub);
            await client.set(REDIS_SUBS_KEY, JSON.stringify(filtered));
        } catch (e) {
            console.error('Redis Subscription Save Error:', e);
        }
    }
};

export const getSubscriptions = async (): Promise<LocationSubscription[]> => {
    if (isDev) {
        if (fs.existsSync(SUBS_FILE)) {
            try {
                const data = fs.readFileSync(SUBS_FILE, 'utf-8');
                return JSON.parse(data);
            } catch (e) {
                return [];
            }
        }
        return [];
    } else {
        try {
            const client = getRedisClient();
            if (!client) return [];
            const data = await client.get(REDIS_SUBS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Redis Subscription Fetch Error:', e);
            return [];
        }
    }
};
