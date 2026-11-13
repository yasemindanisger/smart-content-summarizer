import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Resmi Google Gen AI SDK ile başlatma
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { text, mode } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Please enter or paste some text to summarize.' }, { status: 400 });
    }

    // Seçilen moda göre sistem talimatı
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

    // Resmi SDK kullanarak en kararlı flash modeline istek atma
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `${systemPrompt}\n\nText to summarize:\n${text}`,
      config: {
        temperature: 0.5,
      }
    });

    const summaryResult = response.text;

    return NextResponse.json({ summary: summaryResult });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
