import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Edge runtime is required for streaming
export const runtime = "edge";

export async function POST(req: NextRequest) {
    console.log('API route called');

    try {
        // Check if API key exists
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set');
            return NextResponse.json({
                error: "API key not configured",
                debug: "Please set GEMINI_API_KEY in your environment variables"
            }, { status: 500 });
        }

        const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('GoogleAI initialized');

        const body = await req.json();
        console.log('Request body:', body);

        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({
                error: "Invalid messages format",
                received: typeof messages,
                debug: "Expected an array of messages"
            }, { status: 400 });
        }

        if (messages.length === 0) {
            return NextResponse.json({
                error: "No messages provided",
                debug: "Messages array is empty"
            }, { status: 400 });
        }

        // Create a system prompt and conversation history
        const systemPrompt = "You are Bumblebyte, an AI assistant that helps users with programming and computer science-related questions. Provide clear, concise, and accurate information. If you don't know the answer, admit it. Don't make up answers and Answer any questions or comments about outside of computer science and programming with 'I'm sorry, I can only assist with programming and computer science-related questions.'";

        // Format messages for Gemini - use the latest message as the main prompt
        const lastMessage = messages[messages.length - 1];
        const conversationContext = messages.slice(0, -1).map((message: any) => {
            return `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`;
        }).join('\n');

        const fullPrompt = conversationContext ?
            `${systemPrompt}\n\nPrevious conversation:\n${conversationContext}\n\nUser: ${lastMessage.content}` :
            `${systemPrompt}\n\nUser: ${lastMessage.content}`;

        console.log('Prompt created, length:', fullPrompt.length);

        const model = googleAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        console.log('Model initialized, generating content...');

        // Try non-streaming first to debug
        try {
            const result = await model.generateContent(fullPrompt);
            console.log('Content generated');

            const response = await result.response;
            const text = response.text();

            console.log('Response text length:', text.length);

            // Return as JSON for easier debugging
            return NextResponse.json({
                content: text,
                debug: "Success"
            });

        } catch (genError) {
            console.error('Generation error:', genError);
            return NextResponse.json({
                error: "Failed to generate response",
                details: genError instanceof Error ? genError.message : 'Unknown error',
                debug: "Error in model.generateContent"
            }, { status: 500 });
        }

    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : 'Unknown error',
            debug: "Error in main try-catch"
        }, { status: 500 });
    }

    // This should never be reached, but just in case
    return NextResponse.json({
        error: "Unexpected end of function",
        debug: "This should not happen"
    }, { status: 500 });
}