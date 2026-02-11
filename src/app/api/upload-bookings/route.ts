import { NextResponse } from 'next/server';
import { saveBookings, getBookings } from '@/app/utils/db';
import { sendPushNotification } from '@/app/utils/push';

// Prevent caching
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        console.log('[Upload API] Received booking data...');

        // Standardized security check (Shared Secret)
        const apiKey = (req.headers.get('x-api-key') || '').trim();
        const serverSecret = (process.env.MY_CUSTOM_KEY || process.env.ALERT_SYSTEM_SECRET || process.env.API_SECRET || '').trim();

        if (!serverSecret) {
            console.error("❌ CRITICAL: Security secret is missing!");
            return NextResponse.json({
                success: false,
                message: 'Server config error: Missing secret',
                diagnostics: 'Check MY_CUSTOM_KEY'
            }, { status: 500 });
        }


        if (apiKey !== serverSecret) {
            console.error('[Upload API] Invalid API Key');
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }


        const body = await req.json();
        const { bookings } = body;

        if (!Array.isArray(bookings) || bookings.length === 0) {
            return NextResponse.json({ success: true, message: 'No bookings to save' });
        }

        console.log(`[Upload API] Processing ${bookings.length} bookings...`);

        const existingHistory = await getBookings();
        const existingIds = new Set(existingHistory.map((h: any) => h.id.toString()));

        const newBookings: any[] = [];
        const updates: any[] = [];

        for (const booking of bookings) {
            // Ensure ID is string
            booking.id = booking.id.toString();

            const existingById = existingHistory.find((h: any) => h.id === booking.id);

            // Deduplication Logic: Check if a booking with same (Location + Date + Time) already exists
            // This handles the case where Node.js script created an ID (e.g. "123") and Python script uses UID (e.g. "999")
            // Also sanitize dates to avoid "2001" mismatches blocking deduplication if we want to be fuzzy? 
            // Actually, if DB has 2001 and new is 2026, they WON'T match on date.
            // But we should check if everything ELSE matches? 
            // Let's stick to strict match for now, but if we find a match, we merge.

            // KEY FIX: The "2001" issue means we might have loose duplicates. 
            // If we can't find exact match, maybe we search for same Time + Location + Platform and Date-Day-Month match?
            // For now, let's rely on the Python script sending correct 2026 dates.
            // If the DB has 2001, it won't be found as a duplicate of 2026. 
            // So we effectively treat it as new? NO, we want to replace the 2001 one.

            // Strategy: 
            // 1. Try ID match.
            // 2. Try Exact Content Match.
            // 3. Try "Fuzzy" Match (Same Location + Time + Platform + Day/Month, ignoring Year if one is 2001?)

            let targetRecord = existingById;

            if (!targetRecord) {
                targetRecord = existingHistory.find((h: any) =>
                    h.location === booking.location &&
                    h.gameTime === booking.gameTime &&
                    h.platform === booking.platform &&
                    (h.gameDate === booking.gameDate || (h.gameDate && h.gameDate.includes('2001') && booking.gameDate && !booking.gameDate.includes('2001')))
                );
            }

            if (targetRecord) {
                // Update Logic: Merge if new data is better
                let needsUpdate = false;
                const merged = { ...targetRecord }; // Start with existing

                // Helper to check if field is "empty" or contains garbage labels
                const isEmpty = (val: string) => {
                    if (!val) return true;
                    const v = val.trim().toLowerCase();
                    return v === 'missing' || v === 'tbd' || v === '' || v === 'n/a' || v === 'general' || v === 'user' || v === 'buyer' || v === 'customer';
                };
                const isBadYear = (val: string) => val && val.includes('2001');

                // Update Date if existing is bad/empty and new is good
                if ((isEmpty(merged.gameDate) || isBadYear(merged.gameDate)) && !isEmpty(booking.gameDate) && !isBadYear(booking.gameDate)) {
                    merged.gameDate = booking.gameDate;
                    merged.bookingSlot = booking.bookingSlot; // Update slot too
                    needsUpdate = true;
                }

                // Update other fields if empty
                if (isEmpty(merged.bookingName) && !isEmpty(booking.bookingName)) {
                    merged.bookingName = booking.bookingName;
                    needsUpdate = true;
                }
                if (isEmpty(merged.sport) && !isEmpty(booking.sport)) {
                    merged.sport = booking.sport;
                    needsUpdate = true;
                }
                if (isEmpty(merged.paidAmount) && !isEmpty(booking.paidAmount)) {
                    merged.paidAmount = booking.paidAmount;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    updates.push(merged);
                }
            } else {
                newBookings.push(booking);
            }
        }

        // Merge logic: Filter out old versions of updated bookings, add new/updated ones
        const inputs = [...newBookings, ...updates];
        if (inputs.length > 0) {
            // 1. Get all current bookings excluding the ones we are about to update
            const updateIds = new Set(updates.map(u => u.id));
            const retainedHistory = existingHistory.filter((h: any) => !updateIds.has(h.id));

            // 2. Combine retained + inputs
            const combined = [...retainedHistory, ...inputs];

            // 3. Save
            await saveBookings(combined);

            // 4. Notifications for NEW bookings only (not updates)
            for (const alert of newBookings) {
                await sendPushNotification(alert.location, {
                    title: `🏆 New ${alert.sport || 'Booking'}!`,
                    body: `${alert.platform}: ${alert.gameTime} at ${alert.location}`,
                    url: '/'
                }).catch(err => console.error('Push error:', err));
            }
        }

        console.log(`[Upload API] Saved ${newBookings.length} new, Updated ${updates.length} bookings.`);

        return NextResponse.json({
            success: true,
            added: newBookings.length,
            updated: updates.length
        });

    } catch (error: any) {
        console.error('[Upload API] Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        }, { status: 500 });
    }
}

