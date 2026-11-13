
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, mode } = await req.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Please enter some text to summarize.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing.');

      return NextResponse.json(
        { error: 'API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const prompts = {
      bullets:
        'Summarize the text into 3 to 5 clear and informative bullet points in English.',
      short:
        'Summarize the text into a concise paragraph, maximum 2 paragraphs, in English.',
      keywords:
        'Extract the 5 most important keywords and provide a brief explanation for each in English.'
    };

    const systemPrompt = prompts[mode] || prompts.bullets;

    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';

    console.log('Sending request to Gemini...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nText to summarize:\n${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 2048
        }
      }),
      signal: AbortSignal.timeout(18000),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', response.status, data);

      let message = 'Gemini API request failed.';

      if (response.status === 503) {
        message =
          'Gemini is temporarily overloaded. Please try again shortly.';
      } else if (response.status === 429) {
        message =
          'API quota or rate limit reached. Check your Gemini API usage.';
      } else if (response.status === 403) {
        message =
          'API access denied. Check your Gemini API key and permissions.';
      } else {
        message = data.error?.message || message;
      }

      return NextResponse.json(
        { error: message },
        { status: response.status }
      );
    }

    const summary = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();

    if (!summary) {
      console.error('Empty Gemini response:', data);

      return NextResponse.json(
        { error: 'Gemini returned an empty response.' },
        { status: 502 }
      );
    }

    console.log('Summary generated successfully.');

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Summary API Error:', error);

    if (
      error.name === 'TimeoutError' ||
      error.name === 'AbortError'
    ) {
      return NextResponse.json(
        {
          error: 'Gemini took too long to respond. Please try again.'
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
