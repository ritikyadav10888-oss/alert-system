import { sendTelegramAlert } from '../src/app/utils/webhooks';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testTelegram() {
    console.log("🚀 Sending Test Telegram Alert...");
    try {
        await sendTelegramAlert({
            id: 'TEST-123',
            platform: 'System',
            location: 'Thane',
            sport: 'Cricket',
            bookingSlot: '08:00 PM - 09:00 PM',
            bookingName: 'Ritik Yadav',
            paidAmount: '₹500',
            timestamp: new Date(),
            message: '✅ This is a test notification from your Turf Alert System!'
        });
        console.log("📡 Test signal dispatched. Check your Telegram!");
    } catch (e) {
        console.error("❌ Test failed:", e);
    }
}

testTelegram();
