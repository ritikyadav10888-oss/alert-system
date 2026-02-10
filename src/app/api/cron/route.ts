import { NextResponse } from 'next/server';
import { syncEmails } from '@/app/utils/email-sync-service';
import { sendDiscordAlert, sendTelegramAlert } from '../../utils/webhooks';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Basic auth check if needed (e.g., via a CRON_SECRET env var)
    const apiKey = request.headers.get('x-api-key');
    // Allow Vercel Cron (which uses proper CRON_SECRET if configured, but here we use our custom API_SECRET for simplicity across platforms)
    // In production Vercel Cron, you might want check: request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`
    // For now, we standardize on x-api-key for our custom instrumentation
    if (apiKey !== process.env.API_SECRET) {
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
        console.error("Cron Job Failed:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
