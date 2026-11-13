
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, mode } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Please enter some text to summarize.' },
        { status: 400 }
      );
    }

    let systemPrompt = 'You are a helpful and professional text analyst.';

    if (mode === 'bullets') {
      systemPrompt =
        'Summarize the text into 3 to 5 clear and informative bullet points in English.';
    } else if (mode === 'short') {
      systemPrompt =
        'Summarize the text into a concise, well-structured paragraph, maximum 2 paragraphs, in English.';
    } else if (mode === 'keywords') {
      systemPrompt =
        'Extract the 5 most important keywords and provide a brief explanation for each in English.';
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing in Vercel environment variables.');
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nText to summarize:\n${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);

      return NextResponse.json(
        {
          error: data.error?.message || 'Gemini API request failed.',
        },
        { status: response.status }
      );
    }

    const summaryResult = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

    if (!summaryResult) {
      throw new Error('Gemini returned an empty response.');
    }

    return NextResponse.json({
      summary: summaryResult,
    });

  } catch (error) {
    console.error('Summary API Error:', error);

    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
