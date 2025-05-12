import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI with your API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Make sure to set this in .env.local
});

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
            {
                role: "system",
                content: "You are a concise and helpful AI mentor. Keep your responses brief and to the point.",
            },
            ...messages,
            ],
            temperature: 0.7,
            max_tokens: 100, // Limit the response length
        });

        const reply = completion.choices[0]?.message?.content;

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
