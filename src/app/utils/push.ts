import webpush from 'web-push';
import { getSubscriptions } from './subscriptions';

const vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:alert-system@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

export const sendPushNotification = async (location: string, payload: { title: string, body: string, url?: string }) => {
    const subscriptions = getSubscriptions();

    // Filter by location (Targeted) or include all if location is missing/generic (Broadcast)
    const targetSubs = subscriptions.filter(sub => {
        if (!location || location === 'Unknown' || location === 'General') return true;
        return sub.location === location;
    });

    console.log(`[Push] Sending to ${targetSubs.length} devices for location: ${location || 'Broadcast'}`);

    const promises = targetSubs.map(sub =>
        webpush.sendNotification(sub.subscription, JSON.stringify(payload))
            .catch(err => {
                console.error('Push error:', err);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription has expired or is no longer valid
                    // We should ideally remove it, but for now we just log it
                    console.log('Subscription expired/invalid');
                }
            })
    );

    await Promise.all(promises);
};
