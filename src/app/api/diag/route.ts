import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const allKeys = Object.keys(process.env).sort();

    // Masked values for security
    const status: Record<string, string> = {
        'EMAIL_USER': process.env.EMAIL_USER ? `✅ PRESENT (${process.env.EMAIL_USER.length})` : '❌ MISSING',
        'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD ? `✅ PRESENT (${process.env.EMAIL_PASSWORD.length})` : '❌ MISSING',
        'SECURITY_SECRET': (process.env.MY_CUSTOM_KEY || process.env.ALERT_SYSTEM_SECRET || process.env.API_SECRET || 'secure_alert_sys_2026_x7z9') ? '✅ ACTIVE (ENVIRONMENT OR FALLBACK)' : '❌ MISSING',
        'REDIS_URL': process.env.REDIS_URL ? `✅ PRESENT (${process.env.REDIS_URL.length})` : '❌ MISSING',
        'KV_URL': process.env.KV_URL ? `✅ PRESENT (${process.env.KV_URL.length})` : '❌ MISSING',
    };

    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        vercel_project_name: process.env.VERCEL_PROJECT_NAME || 'Unknown',
        vercel_env: process.env.VERCEL_ENV || 'Unknown',
        env_status: status
    });


}
