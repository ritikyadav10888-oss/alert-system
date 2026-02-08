/**
 * 📢 External Webhook Dispatcher
 * This utility sends booking alerts to Discord, Telegram, or other services.
 */

interface WebhookAlert {
    id: string;
    platform: string;
    location: string;
    sport?: string;
    bookingSlot?: string;
    bookingName?: string;
    paidAmount?: string;
    timestamp: Date;
    message: string;
}

export async function sendDiscordAlert(alert: WebhookAlert) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    const embed = {
        title: `🚀 New ${alert.platform} Booking!`,
        description: alert.message,
        color: alert.platform === 'Playo' ? 0x2e7d32 :
            alert.platform === 'Hudle' ? 0x0277bd :
                alert.platform === 'Khelomore' ? 0xd84315 : 0x0f172a,
        fields: [
            { name: "📍 Location", value: alert.location, inline: true },
            { name: "⚽ Sport", value: alert.sport || "General", inline: true },
            { name: "⏰ Slot", value: alert.bookingSlot || "N/A", inline: true },
            { name: "👤 Customer", value: alert.bookingName || "N/A", inline: true },
            { name: "💰 Amount", value: alert.paidAmount || "N/A", inline: true }
        ],
        footer: { text: `Booking ID: ${alert.id}` },
        timestamp: alert.timestamp.toISOString()
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        console.log(`✅ Discord Alert Sent: ${alert.id}`);
    } catch (e) {
        console.error("❌ Failed to send Discord alert:", e);
    }
}

export async function sendTelegramAlert(alert: WebhookAlert) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return;

    const text = `🚀 *New ${alert.platform} Booking!*\n\n` +
        `📍 *Location:* ${alert.location}\n` +
        `⚽ *Sport:* ${alert.sport || 'General'}\n` +
        `⏰ *Slot:* ${alert.bookingSlot || 'N/A'}\n` +
        `👤 *Customer:* ${alert.bookingName || 'N/A'}\n` +
        `💰 *Amount:* ${alert.paidAmount || 'N/A'}\n\n` +
        `💬 ${alert.message}`;

    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });
        console.log(`✅ Telegram Alert Sent: ${alert.id}`);
    } catch (e) {
        console.error("❌ Failed to send Telegram alert:", e);
    }
}
