import fs from 'fs';
import path from 'path';

const SUBS_PATH = path.join(process.cwd(), 'data', 'subscriptions.json');

export interface PushSubscriptionData {
    id: string;
    subscription: any;
    location: string;
    timestamp: number;
}

export const getSubscriptions = (): PushSubscriptionData[] => {
    if (!fs.existsSync(path.dirname(SUBS_PATH))) {
        fs.mkdirSync(path.dirname(SUBS_PATH), { recursive: true });
    }
    if (!fs.existsSync(SUBS_PATH)) {
        return [];
    }
    try {
        return JSON.parse(fs.readFileSync(SUBS_PATH, 'utf-8'));
    } catch (e) {
        return [];
    }
};

export const saveSubscription = (data: PushSubscriptionData) => {
    const subs = getSubscriptions();
    // Use endpoint as unique key for the device
    const existingIdx = subs.findIndex(s => s.subscription.endpoint === data.subscription.endpoint);

    if (existingIdx !== -1) {
        subs[existingIdx] = data; // Update
    } else {
        subs.push(data); // Add new
    }

    fs.writeFileSync(SUBS_PATH, JSON.stringify(subs, null, 2));
};
