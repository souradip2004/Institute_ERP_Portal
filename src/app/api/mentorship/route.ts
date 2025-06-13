import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await fetch('https://ai-counsellor-reports-feedback-6ecdbce-v1.app.beam.cloud/', {
            method: 'POST',
            headers: {
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA==',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred', details: error.message }, { status: 500 });
    }
}