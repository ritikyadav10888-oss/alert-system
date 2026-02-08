export async function register() {
    // Only run on the server side
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const cron = await import('node-cron');

        console.log("🤖 Auto-Pilot Started: Background Sync Worker Active");

        // 🕒 Check for emails every 60 seconds
        cron.schedule('*/1 * * * *', async () => {
            console.log("🔄 Background Sync: Checking for new bookings...");
            try {
                // Use the local API route to ensure identical logic
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                const res = await fetch(`${baseUrl}/api/cron`);
                const data = await res.json();

                if (data.success && data.alerts && data.alerts.length > 0) {
                    console.log(`✅ Background Sync: Found ${data.alerts.length} new alerts.`);
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
                await fetch(`${baseUrl}/api/daily-summary`);
            } catch (e) {
                console.error("❌ Daily Summary Error:", e);
            }
        });
    }
}
