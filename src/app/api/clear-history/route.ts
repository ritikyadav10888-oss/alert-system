import { NextResponse } from 'next/server';
import { clearHistory } from '@/app/utils/db';

export async function POST() {
    try {
        await clearHistory();
        return NextResponse.json({ success: true, message: 'History cleared from Firestore' });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
