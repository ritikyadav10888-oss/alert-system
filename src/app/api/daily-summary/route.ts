import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { sendDiscordAlert, sendTelegramAlert } from '../../utils/webhooks';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const apiKey = (req.headers.get('x-api-key') || '').trim();
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

    try {
        const historyData = await kv.get('booking_history');
        if (!historyData) return NextResponse.json({ success: false, message: 'No history found' });

        const history = (historyData as any[]).map(item => ({
            ...item,
            timestamp: new Date(item.timestamp)
        }));

        // Filter for today's bookings
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayBookings = history.filter(item => {
            const itemDate = new Date(item.timestamp);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === today.getTime();
        });

        if (todayBookings.length === 0) {
            return NextResponse.json({ success: true, message: 'No bookings today, no summary sent' });
        }

        // Aggregate Stats
        const totalRevenue = todayBookings.reduce((sum, item) => {
            const amount = parseFloat(item.paidAmount?.replace(/[^\d.]/g, '') || '0');
            return sum + amount;
        }, 0);

        const sportStats = todayBookings.reduce((acc: any, item) => {
            const sport = item.sport || 'General';
            acc[sport] = (acc[sport] || 0) + 1;
            return acc;
        }, {});

        const summaryMsg = {
            id: `SUMMARY-${today.toISOString().split('T')[0]}`,
            platform: 'SYSTEM',
            location: 'All Locations',
            message: `📊 *Daily Revenue Report*\n` +
                `💰 Total Today: ₹${totalRevenue.toLocaleString()}\n` +
                `📅 Total Bookings: ${todayBookings.length}\n` +
                `⚽ Breakdown: ${Object.entries(sportStats).map(([s, c]) => `${s}: ${c}`).join(', ')}`,
            timestamp: new Date(),
        };

        // Dispatch summary alert (Mocking the format for webhooks)
        const webhookData = {
            ...summaryMsg,
            bookingSlot: "Daily Summary",
            bookingName: "Report",
            paidAmount: `₹${totalRevenue}`
        };

        await Promise.allSettled([
            sendDiscordAlert(webhookData as any),
            sendTelegramAlert(webhookData as any)
        ]);

        return NextResponse.json({ success: true, revenue: totalRevenue, count: todayBookings.length });
    } catch (e: any) {
        console.error("[API_Error] Daily Summary failed:", e);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: e.message
        }, { status: 500 });
    }
}
