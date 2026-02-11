export async function register() {
    // Only run on the server side
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const cron = await import('node-cron');

        console.log("🤖 Auto-Pilot Started: Background Sync Worker Active");

        // 🕒 Check for emails every 60 seconds
        cron.schedule('*/1 * * * *', async () => {
            console.log("🔄 Background Sync: Checking for new bookings...");
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                const secret = (process.env.MY_CUSTOM_KEY || process.env.ALERT_SYSTEM_SECRET || process.env.API_SECRET || 'secure_alert_sys_2026_x7z9').trim();
                const res = await fetch(`${baseUrl}/api/cron`, {
                    headers: { 'x-api-key': secret }
                });


                const text = await res.text();

                try {
                    const data = JSON.parse(text);
                    if (data.success && data.alerts && data.alerts.length > 0) {
                        console.log(`✅ Background Sync: Found ${data.alerts.length} new alerts.`);
                    }
                } catch (parseError) {
                    console.error("❌ Background Sync JSON Parse Error. Response:", text.substring(0, 500)); // Log first 500 chars
                    throw parseError;
                }
            } catch (e) {
                console.error("❌ Background Sync Error:", e);
            }
        });

        // 📊 Daily Summary at 11:59 PM
        cron.schedule('59 23 * * *', async () => {
            console.log("📑 Auto-Pilot: Generating Daily Summary...");
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                const secret = (process.env.MY_CUSTOM_KEY || process.env.ALERT_SYSTEM_SECRET || process.env.API_SECRET || 'secure_alert_sys_2026_x7z9').trim();
                await fetch(`${baseUrl}/api/daily-summary`, {
                    headers: { 'x-api-key': secret }
                });


            } catch (e) {
                console.error("❌ Daily Summary Error:", e);
            }
        });
    }
}
