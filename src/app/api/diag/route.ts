import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const allKeys = Object.keys(process.env).sort();

    // Masked values for security
    const maskedEnv: Record<string, string> = {};
    allKeys.forEach(k => {
        const val = process.env[k];
        if (val) {
            maskedEnv[k] = `(Length: ${val.length})`;
        }
    });

    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        node_env: process.env.NODE_ENV,
        all_detected_keys: allKeys,
        masked_env: maskedEnv
    });
}
