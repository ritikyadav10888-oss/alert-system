
import { NextResponse } from 'next/server';
import { getBookings, saveBookings } from '@/app/utils/db';

export async function POST(request: Request) {
    try {
        const apiKey = (request.headers.get('x-api-key') || '').trim();
        const serverSecret = (process.env.ALERT_SYSTEM_SECRET || process.env.API_SECRET || '').trim();

        if (!serverSecret) {
            console.error("❌ CRITICAL: Security secret is missing!");
            return NextResponse.json({
                success: false,
                message: 'Server config error: Missing secret',
                diagnostics: 'Check ALERT_SYSTEM_SECRET'
            }, { status: 500 });
        }

        if (apiKey !== serverSecret) {
            console.warn(`[Auth_Fail] Delete attempt with invalid key: "${apiKey.substring(0, 3)}..."`);
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing booking ID' }, { status: 400 });
        }

        console.log(`[API_Delete] Attempting to delete booking: ${id}`);
        const bookings = await getBookings();
        const initialLength = bookings.length;
        const filtered = bookings.filter(b => b.id !== id && b.id !== id.toString());

        if (filtered.length === initialLength) {
            console.warn(`[API_Delete] Booking not found: ${id}`);
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        await saveBookings(filtered);
        console.log(`[API_Delete] Successfully deleted booking: ${id}`);

        return NextResponse.json({ success: true, message: 'Booking deleted' });
    } catch (error: any) {
        console.error("[API_Fatal] Error in delete-booking:", error);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        }, { status: 500 });
    }
}

