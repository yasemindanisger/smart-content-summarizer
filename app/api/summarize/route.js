
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
      return NextResponse.json(
        { error: 'Gemini API key is missing.' },
        { status: 500 }
      );
    }

    const prompts = {
      bullets: 'Summarize the following text using clear and concise bullet points.',
      short: 'Write a short paragraph summarizing the following text.',
      keywords: 'Extract the most important keywords and key phrases from the following text.'
    };

    const systemPrompt = prompts[mode] || prompts.bullets;

    console.log('Sending request to Gemini Interactions API...');

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          model: 'gemini-3.5-flash-lite',
          input: `${systemPrompt}\n\nText to summarize:\n${text}`,
          generation_config: {
            thinking_level: 'low',
            max_output_tokens: 2048
          }
        }),
        signal: AbortSignal.timeout(25000),
        cache: 'no-store'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', response.status, data);

      let message = 'Gemini API request failed.';

      if (response.status === 503) {
        message = 'Gemini is temporarily overloaded. Please try again shortly.';
      } else if (response.status === 429) {
        message = 'Gemini API quota or rate limit reached.';
      } else if (response.status === 403) {
        message = 'API access denied. Check your Gemini API key.';
      } else {
        message = data.error?.message || message;
      }

      return NextResponse.json(
        { error: message },
        { status: response.status }
      );
    }

    const summary = (data.steps || [])
      .filter(step => step.type === 'model_output')
      .flatMap(step => step.content || [])
      .filter(item => item.type === 'text')
      .map(item => item.text || '')
      .join('\n')
      .trim();

    if (!summary) {
      console.error('Gemini returned no summary:', data);

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
        { error: 'Gemini took too long to respond. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
