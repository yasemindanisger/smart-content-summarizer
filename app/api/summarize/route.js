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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.5,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to process request with OpenAI API.');
    }

    const summaryResult = data.choices[0].message.content;

    return NextResponse.json({ summary: summaryResult });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}