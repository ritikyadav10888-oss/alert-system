import { NextResponse } from 'next/server';
import { syncEmails } from '@/app/utils/email-sync-service';

// Prevent caching for this API route
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Basic auth check if needed (e.g., via a CRON_SECRET env var)
    const apiKey = (req.headers.get('x-api-key') || '').trim();
    const serverSecret = (process.env.ALERT_SYSTEM_SECRET || process.env.API_SECRET || '').trim();

    if (!serverSecret) {
        console.error("❌ CRITICAL: Security secret is missing!");
        return NextResponse.json({
            success: false,
            message: 'Server configuration error: Missing Security Secret',
            diagnostics: 'Please check ALERT_SYSTEM_SECRET in Vercel'
        }, { status: 500 });
    }


    if (apiKey !== serverSecret) {
        console.warn(`[Auth_Fail] Invalid API Key provided: "${apiKey.substring(0, 3)}..."`);
        return NextResponse.json({ success: false, message: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const depth = searchParams.get('depth') || 'standard';

    try {
        const result = await syncEmails(depth);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            console.error("[API_Error] syncEmails failed:", result.message);
            return NextResponse.json(result, { status: 500 });
        }
    } catch (error: any) {
        console.error("[API_Fatal] Unexpected error in check-emails:", error);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        }, { status: 500 });
    }
}

