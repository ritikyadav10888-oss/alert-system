import { NextResponse } from 'next/server';
import { getBookings } from '@/app/utils/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const history = await getBookings();

        // Sort by timestamp (descending - newest first)
        const sortedHistory = history.sort((a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return NextResponse.json({ success: true, history: sortedHistory });
    } catch (e: any) {
        console.error("Failed to fetch history", e);
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
