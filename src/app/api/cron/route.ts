import { NextResponse } from 'next/server';
import { syncEmails } from '@/app/utils/email-sync-service';
import { sendDiscordAlert, sendTelegramAlert } from '../../utils/webhooks';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Basic auth check if needed (e.g., via a CRON_SECRET env var)
    const apiKey = (request.headers.get('x-api-key') || '').trim();
    const serverSecret = (process.env.API_SECRET || '').trim();

    if (!serverSecret) {
        console.error("❌ CRITICAL: API_SECRET is missing!");
        return NextResponse.json({
            success: false,
            message: 'Server config error: Missing API_SECRET'
        }, { status: 500 });
    }

    if (apiKey !== serverSecret) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }


    const { searchParams } = new URL(request.url);
    const depth = searchParams.get('depth') || 'standard';

    try {
        const result = await syncEmails(depth);

        if (!result.success) {
            return NextResponse.json(result, { status: 500 });
        }

        // 📢 DISPATCH WEBHOOKS for new alerts
        // Note: syncEmails already saves to DB and sends Push Notifications.
        // We just need to handle the external webhooks here if they are still needed.
        if (result.alerts && result.alerts.length > 0) {
            for (const alert of result.alerts) {
                const webhookData = {
                    ...alert,
                    timestamp: new Date(alert.timestamp)
                };

                // Send concurrent notifications
                await Promise.allSettled([
                    sendDiscordAlert(webhookData),
                    sendTelegramAlert(webhookData)
                ]);
            }
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[Cron_Fatal] Job Failed:", error);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        }, { status: 500 });
    }
}

