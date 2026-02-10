
import { NextResponse } from 'next/server';
import { getBookings, saveBookings } from '@/app/utils/db';

export async function POST(request: Request) {
    try {
        const apiKey = (request.headers.get('x-api-key') || '').trim();
        const serverSecret = (process.env.API_SECRET || '').trim();

        if (!serverSecret) {
            console.error("❌ CRITICAL: API_SECRET is missing!");
            return NextResponse.json({ success: false, message: 'Server config error' }, { status: 500 });
        }

        if (apiKey !== serverSecret) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing booking ID' }, { status: 400 });
        }

        const bookings = await getBookings();
        const initialLength = bookings.length;
        const filtered = bookings.filter(b => b.id !== id && b.id !== id.toString());

        if (filtered.length === initialLength) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        await saveBookings(filtered);

        return NextResponse.json({ success: true, message: 'Booking deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
