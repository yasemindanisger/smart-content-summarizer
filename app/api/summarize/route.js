import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, mode } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Please enter or paste some text to summarize.' }, { status: 400 });
    }

    // Dynamic system prompts based on selected mode
    let systemPrompt = "You are a helpful and professional text analyst.";
    if (mode === 'bullets') {
      systemPrompt = "Analyze the provided text and summarize the key insights into 3 to 5 clear bullet points in English.";
    } else if (mode === 'short') {
      systemPrompt = "Summarize the provided text into a concise, well-structured, and fluid paragraph (max 2 paragraphs) in English.";
    } else if (mode === 'keywords') {
      systemPrompt = "Extract the top 5 most important keywords or key terms from the provided text and provide a brief 1-sentence explanation for each in English.";
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }

    // v1 endpoint ve gemini-1.5-flash kombinasyonu
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nText to summarize:\n${text}` }]
          }
        ],
        generationConfig: {
          temperature: 0.5,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to process request with Gemini API.');
    }

    const summaryResult = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ summary: summaryResult });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
