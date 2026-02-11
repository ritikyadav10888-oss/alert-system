import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const requiredVars = [
        'EMAIL_USER',
        'EMAIL_PASSWORD',
        'API_SECRET',
        'NEXT_PUBLIC_API_SECRET',
        'REDIS_URL',
        'KV_URL',
        'GEMINI_API_KEY'
    ];

    const status: Record<string, string> = {};

    requiredVars.forEach(v => {
        const val = process.env[v];
        if (!val) {
            status[v] = '❌ MISSING';
        } else if (val.trim() === '') {
            status[v] = '⚠️ EMPTY STRING';
        } else {
            status[v] = `✅ PRESENT (Length: ${val.length})`;
        }
    });

    return NextResponse.json({
        success: true,
        node_env: process.env.NODE_ENV,
        env_status: status
    });
}
