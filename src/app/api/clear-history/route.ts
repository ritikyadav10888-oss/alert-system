import { NextResponse } from 'next/server';
import { clearHistory } from '@/app/utils/db';

export async function POST(req: Request) {
    const apiKey = (req.headers.get('x-api-key') || '').trim();
    const serverSecret = (process.env.MY_CUSTOM_KEY || process.env.ALERT_SYSTEM_SECRET || process.env.API_SECRET || '').trim();

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
        await clearHistory();
        return NextResponse.json({ success: true, message: 'History cleared' });
    } catch (e: any) {
        console.error("[API_Error] Clear History failed:", e);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: e.message
        }, { status: 500 });
    }
}

