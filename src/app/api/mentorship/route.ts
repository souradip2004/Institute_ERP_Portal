import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await fetch('https://ai-counsellor-reports-feedback-a239e5a-v2.app.beam.cloud', {
            method: 'POST',
            headers: {
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer cpxjIHGyDUggeCZSEgd7TSs_xuIaJLxQyplSlPcpEv35qftljIUmetr9Drtj_MUyC9PUSJLvV1vbjljWohB8Sw==',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred', details: error.message }, { status: 500 });
    }
}