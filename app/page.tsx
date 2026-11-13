
'use client';

import { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  FileText,
  RefreshCw
} from 'lucide-react';

export default function Home() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('bullets');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Please enter some text first.');
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          mode,
        }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate summary.');
      }

      if (!data.summary) {
        throw new Error('No summary was returned.');
      }

      setSummary(data.summary);

    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || 'Something went wrong.');
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Unable to copy text.');
    }
  };

  const modes = [
    { id: 'bullets', label: 'Bullet Points' },
    { id: 'short', label: 'Paragraph' },
    { id: 'keywords', label: 'Keywords' },
  ];

  return (
    <main className="min-h-screen bg-white-100 text-gray-900 font-sans">

      {/* Header */}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="bg-blue-900 text-white p-2 rounded-md">
            <FileText className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Smart Content Summarizer
            </h1>
            <p className="text-xs text-gray-500">
              AI-Powered Text Intelligence
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}

      <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">

        <div className="text-center mb-10 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Make Your Content Easier to Understand
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Turn long articles, documents, and notes into clear,
            concise summaries with the help of Google Gemini AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Input Card */}

          <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-5">

            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-900" />
                Source Text
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Paste the text you want to summarize below.
              </p>
            </div>

            <div>
              <textarea
                rows={12}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your article, document, essay, or notes here..."
                className="w-full resize-y rounded-md border border-gray-300 bg-white p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition"
              />

              <div className="text-right text-xs text-gray-500 mt-2">
                {text.length.toLocaleString()} characters
              </div>
            </div>

            {/* Output Format */}

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Output Format
              </label>

              <div className="grid grid-cols-3 gap-2">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    aria-pressed={mode === m.id}
                    className={`rounded-md border px-2 py-3 text-xs sm:text-sm font-medium transition ${
                      mode === m.id
                        ? 'bg-blue-900 border-blue-900 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}

            <button
              type="button"
              onClick={handleSummarize}
              disabled={loading || !text.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-5 transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Text...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Summary
                </>
              )}
            </button>

            {/* Error */}

            {error && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm"
              >
                {error}
              </div>
            )}

          </section>

          {/* Output Card */}

          <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col">

            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Generated Summary
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Your summarized content will appear here.
                </p>
              </div>

              {summary && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-700" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 mt-5 min-h-[300px] rounded-md border border-gray-200 bg-gray-50 p-5">
              {summary ? (
                <div className="text-sm leading-7 text-gray-800 whitespace-pre-line">
                  {summary}
                </div>
              ) : (
                <div className="min-h-[260px] flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-200 rounded-full p-4 mb-4">
                    <FileText className="w-7 h-7 text-gray-500" />
                  </div>

                  <p className="text-gray-700 font-medium">
                    No summary yet
                  </p>

                  <p className="text-sm text-gray-500 mt-2 max-w-xs">
                    Your AI-generated summary will appear here after
                    you submit your text.
                  </p>
                </div>
              )}
            </div>

          </section>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-500">
            Powered by Google Gemini AI
          </p>

          <p className="text-xs text-gray-400 mt-2">
            Smart Content Summarizer © 2026
          </p>
        </footer>

      </div>
    </main>
  );
}
