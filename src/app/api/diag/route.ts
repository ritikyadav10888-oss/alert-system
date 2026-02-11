import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const allKeys = Object.keys(process.env).sort();

    // Masked values for security
    const status: Record<string, string> = {
        'EMAIL_USER': process.env.EMAIL_USER ? `✅ PRESENT (${process.env.EMAIL_USER.length})` : '❌ MISSING',
        'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD ? `✅ PRESENT (${process.env.EMAIL_PASSWORD.length})` : '❌ MISSING',
        'VERCEL_ENV_TEST': process.env.VERCEL_ENV_TEST ? `✅ PRESENT (${process.env.VERCEL_ENV_TEST.length})` : '❌ MISSING',
        'MY_CUSTOM_KEY': (process.env.MY_CUSTOM_KEY || 'secure_alert_sys_2026_x7z9') ? `✅ PRESENT (HARDCODED_FALLBACK)` : '❌ MISSING',

        'ALERT_SYSTEM_SECRET': process.env.ALERT_SYSTEM_SECRET ? `✅ PRESENT (${process.env.ALERT_SYSTEM_SECRET.length})` : '❌ MISSING',
        'API_SECRET': process.env.API_SECRET ? `✅ PRESENT (${process.env.API_SECRET.length})` : '❌ MISSING',
        'REDIS_URL': process.env.REDIS_URL ? `✅ PRESENT (${process.env.REDIS_URL.length})` : '❌ MISSING',
        'KV_URL': process.env.KV_URL ? `✅ PRESENT (${process.env.KV_URL.length})` : '❌ MISSING',
    };

    return NextResponse.json({
        success: true,
        version: "V3_FORCE_FRESH_3", // CHANGED THIS
        timestamp: new Date().toISOString(),

        node_env: process.env.NODE_ENV,
        vercel_project_name: process.env.VERCEL_PROJECT_NAME || 'Unknown',
        vercel_env: process.env.VERCEL_ENV || 'Unknown',
        all_detected_keys: allKeys,
        env_status: status
    });

}
