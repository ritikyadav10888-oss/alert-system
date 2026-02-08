import { kv } from '@vercel/kv';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkKV() {
    const history: any = await kv.get('booking_history');
    console.log(`Total Bookings in KV: ${history?.length || 0}`);
    if (history && history.length > 0) {
        // Sort and show top 5
        const latest = history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
        console.log("Latest 5 Bookings:");
        latest.forEach((b: any) => console.log(`- ${b.platform} | ${b.location} | ${b.bookingName} | ${b.timestamp}`));
    }
}

checkKV();
