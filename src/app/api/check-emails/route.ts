import { NextResponse } from 'next/server';
import { syncEmails } from '@/app/utils/email-sync-service';

// Prevent caching for this API route
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Basic auth check if needed (e.g., via a CRON_SECRET env var)
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.API_SECRET) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const depth = searchParams.get('depth') || 'standard';

    const result = await syncEmails(depth);

    if (result.success) {
        return NextResponse.json(result);
    } else {
        return NextResponse.json(result, { status: 500 });
    }
}
