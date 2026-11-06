'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, FileText, RefreshCw } from 'lucide-react';

export default function Home() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('bullets');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate summary.');

      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/20">
            <Sparkles className="w-4 h-4" /> AI-Powered Text Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Smart Content Summarizer</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Effortlessly analyze, condense, and extract key insights from long articles, notes, and documents in seconds.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Source Text
            </label>
            <textarea
              rows="10"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Paste your document, essay, or raw text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {/* Mode Selection */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium">Output Format:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bullets', label: 'Bullet Points' },
                  { id: 'short', label: 'Paragraph' },
                  { id: 'keywords', label: 'Keywords' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      mode === m.id
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSummarize}
              disabled={loading || !text.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing Text...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Summary
                </>
              )}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          {/* Output Section */}
          <div className="space-y-4 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Generated Summary</span>
                {summary && (
                  <button
                    onClick={handleCopy}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 min-h-[260px] whitespace-pre-line text-sm text-slate-300">
                {summary || (
                  <span className="text-slate-600 italic">
                    Your AI-generated summary will appear here...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}