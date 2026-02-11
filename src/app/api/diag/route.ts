import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const requiredVars = [
        'EMAIL_USER',
        'EMAIL_PASSWORD',
        'API_SECRET',
    const status: Record<string, string> = {
        'EMAIL_USER': process.env.EMAIL_USER ? `✅ PRESENT (${process.env.EMAIL_USER.length})` : '❌ MISSING',
        'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD ? `✅ PRESENT (${process.env.EMAIL_PASSWORD.length})` : '❌ MISSING',
        'API_SECRET': process.env.API_SECRET ? `✅ PRESENT (${process.env.API_SECRET.length})` : '❌ MISSING',
        'NEXT_PUBLIC_API_SECRET': process.env.NEXT_PUBLIC_API_SECRET ? `✅ PRESENT (${process.env.NEXT_PUBLIC_API_SECRET.length})` : '❌ MISSING',
        'REDIS_URL': process.env.REDIS_URL ? `✅ PRESENT (${process.env.REDIS_URL.length})` : '❌ MISSING',
        'KV_URL': process.env.KV_URL ? `✅ PRESENT (${process.env.KV_URL.length})` : '❌ MISSING',
        'GEMINI_API_KEY': process.env.GEMINI_API_KEY ? `✅ PRESENT (${process.env.GEMINI_API_KEY.length})` : '❌ MISSING',
    };

    return NextResponse.json({
        success: true,
        node_env: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        env_status: status
    });
}
