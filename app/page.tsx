
'use client';

import { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  FileText,
  RefreshCw,
  AlignLeft,
  List,
  ClipboardPaste,
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

    setLoading(true);
    setError('');
    setSummary('');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, mode }),
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
      const error = err as Error;

      setError(
        error.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : error.message || 'Something went wrong.'
      );
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
    } catch {
      setError('Unable to copy text.');
    }
  };

  const handlePaste = async () => {
    try {
      const pastedText = await navigator.clipboard.readText();
      setText((current) => current + pastedText);
    } catch {
      setError('Clipboard access is not available. Please paste manually.');
    }
  };

  return (
    <main className="app-page">
      <header className="topbar">
        <a href="/" className="brand">
          <span className="brand-icon">
            <Sparkles size={23} />
          </span>
          <span>Smart<span className="brand-highlight">Summarizer</span></span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#summarizer">Summarizer</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-label">
          <Sparkles size={15} />
          AI-POWERED TEXT INTELLIGENCE
        </div>

        <h1>Free Text Summarizer</h1>

        <p>
          Turn long articles, documents, and notes into clear,
          concise summaries with the help of Google Gemini AI.
        </p>
      </section>

      <section className="workspace" id="summarizer">
        <div className="toolbar">
          <span className="toolbar-label">Output format:</span>

          <button
            className={`mode-button ${mode === 'paragraph' ? 'active' : ''}`}
            onClick={() => setMode('paragraph')}
          >
            <AlignLeft size={17} />
            Paragraph
          </button>

          <button
            className={`mode-button ${mode === 'bullets' ? 'active' : ''}`}
            onClick={() => setMode('bullets')}
          >
            <List size={17} />
            Bullet Points
          </button>
        </div>

        <div className="editor-grid">
          <div className="editor-panel">
            <div className="panel-heading">
              <div>
                <FileText size={19} />
                <span>Source Text</span>
              </div>
              <span className="panel-caption">Your original content</span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your article, document, essay, or notes here..."
              className="text-editor"
            />

            <div className="panel-footer">
              <span className="word-count">
                {text.length} characters
              </span>

              <button className="paste-button" onClick={handlePaste}>
                <ClipboardPaste size={16} />
                Paste Text
              </button>
            </div>
          </div>

          <div className="result-panel">
            <div className="panel-heading">
              <div>
                <Sparkles size={19} />
                <span>Generated Summary</span>
              </div>
              <span className="panel-caption">AI-powered result</span>
            </div>

            <div className="result-content">
              {loading ? (
                <div className="empty-state">
                  <RefreshCw className="loading-icon" size={32} />
                  <h3>Generating your summary...</h3>
                  <p>Gemini AI is working on your text.</p>
                </div>
              ) : summary ? (
                <div className="summary-text">{summary}</div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <FileText size={30} />
                  </div>
                  <h3>Your summary will appear here</h3>
                  <p>
                    Enter your text and click Generate Summary
                    to get started.
                  </p>
                </div>
              )}
            </div>

            {summary && (
              <div className="result-actions">
                <button className="copy-button" onClick={handleCopy}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? 'Copied!' : 'Copy Summary'}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="generate-area">
          <button
            className="generate-button"
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <RefreshCw size={19} className="loading-icon" />
            ) : (
              <Sparkles size={19} />
            )}
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>

          <span className="privacy-note">
            Your content is ready for AI-powered summarization.
          </span>
        </div>
      </section>

      <footer className="site-footer" id="about">
        <p>Powered by Google Gemini AI</p>
        <span>Smart Content Summarizer © 2026</span>
      </footer>
    </main>
  );
}
