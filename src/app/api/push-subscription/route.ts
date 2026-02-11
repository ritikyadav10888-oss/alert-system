import { NextResponse } from 'next/server';
import { saveSubscription } from '@/app/utils/subscriptions';

export async function POST(req: Request) {
    const apiKey = (req.headers.get('x-api-key') || '').trim();
    const serverSecret = (process.env.MY_CUSTOM_KEY || process.env.ALERT_SYSTEM_SECRET || process.env.API_SECRET || 'secure_alert_sys_2026_x7z9').trim();

    if (!serverSecret) {

        console.error("❌ CRITICAL: Secret is missing!");
        return NextResponse.json({
            success: false,
            message: 'Server config error: Missing secret'
        }, { status: 500 });
    }


    if (apiKey !== serverSecret) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await req.json();

        if (!data.subscription || !data.location) {
            return NextResponse.json({ success: false, message: 'Missing subscription or location' }, { status: 400 });
        }

        await saveSubscription(data.location, data.subscription);

        return NextResponse.json({ success: true, message: 'Subscription saved' });
    } catch (e: any) {
        console.error("[API_Error] Failed to save subscription:", e);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: e.message
        }, { status: 500 });
    }
}

