import { NextResponse } from 'next/server';
import { clearHistory } from '@/app/utils/db';

export async function POST(req: Request) {
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.API_SECRET) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    try {
        await clearHistory();
        return NextResponse.json({ success: true, message: 'History cleared from Firestore' });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
