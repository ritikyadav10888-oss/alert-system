import { NextResponse } from 'next/server';
import { saveSubscription } from '@/app/utils/subscriptions';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        if (!data.subscription || !data.location) {
            return NextResponse.json({ success: false, message: 'Missing subscription or location' }, { status: 400 });
        }

        saveSubscription({
            id: Date.now().toString(),
            subscription: data.subscription,
            location: data.location,
            timestamp: Date.now()
        });

        return NextResponse.json({ success: true, message: 'Subscription saved' });
    } catch (e: any) {
        console.error("Failed to save subscription", e);
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
