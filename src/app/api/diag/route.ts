import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const allKeys = Object.keys(process.env).sort();

    // Masked values for security
    const status: Record<string, string> = {
        'EMAIL_USER': process.env.EMAIL_USER ? `✅ PRESENT (${process.env.EMAIL_USER.length})` : '❌ MISSING',
        'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD ? `✅ PRESENT (${process.env.EMAIL_PASSWORD.length})` : '❌ MISSING',
        'MY_CUSTOM_KEY': process.env.MY_CUSTOM_KEY ? `✅ PRESENT (${process.env.MY_CUSTOM_KEY.length})` : '❌ MISSING',
        'ALERT_SYSTEM_SECRET': process.env.ALERT_SYSTEM_SECRET ? `✅ PRESENT (${process.env.ALERT_SYSTEM_SECRET.length})` : '❌ MISSING',
        'API_SECRET': process.env.API_SECRET ? `✅ PRESENT (${process.env.API_SECRET.length})` : '❌ MISSING',
        'REDIS_URL': process.env.REDIS_URL ? `✅ PRESENT (${process.env.REDIS_URL.length})` : '❌ MISSING',
        'KV_URL': process.env.KV_URL ? `✅ PRESENT (${process.env.KV_URL.length})` : '❌ MISSING',
    };


    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        node_env: process.env.NODE_ENV,
        all_detected_keys: allKeys,
        env_status: status
    });
}
