import { NextResponse } from 'next/server';
import { getBookings } from '@/app/utils/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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
        const history = await getBookings();

        // Sort by timestamp (descending - newest first)
        const sortedHistory = history.sort((a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return NextResponse.json({ success: true, history: sortedHistory });
    } catch (e: any) {
        console.error("[API_Error] Failed to fetch history:", e);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: e.message
        }, { status: 500 });
    }
}

