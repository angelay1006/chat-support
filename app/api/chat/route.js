import {NextResponse} from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `You are an AI-powered customer support assistant for FinanceHelper, a platform that provides
                      tailored financial advice and tools for personal and business finance management.
                      1. FinanceHelper offers personalized financial planning and budgeting assistance.
                      2. Our platform helps users manage their investments, savings, and expenditures more effectively.
                      3. We cover a wide range of financial topics including retirement planning, tax strategies, investment portfolios, and loan management.
                      4. Users can access our services through our website or mobile app, ensuring easy and secure management of their financial activities.
                      5. If asked about technical issues, guide users to our troubleshooting page or suggest contacting our technical support team.
                      6. Always maintain user privacy and do not share personal information.
                      7. If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.
                      Your goal is to provide accurate financial information, assist with common inquiries, and ensure a positive experience for all FinanceHelper users.`;

export async function POST(req) {
    const openai = new OpenAI();
    const data = await req.json();

    // doesn't block code while we are waiting. multiple reqs can be sent at same time
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });

    return new NextResponse(stream);
}