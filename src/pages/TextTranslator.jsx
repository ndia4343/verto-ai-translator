import { useState, useEffect, useRef } from "react";
import { useTranslate, LANGUAGES, speak, copyText } from "../hooks/useTranslate";
import "./TextTranslator.css";

const TONES = ["Formal", "Casual", "Business", "Simple", "Technical"];
const MAX_CHARS = 5000;

export default function TextTranslator({ showToast }) {
  const { translate, loading } = useTranslate();
  const [src, setSrc] = useState("en");
  const [tgt, setTgt] = useState("es");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [tone, setTone] = useState("Formal");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!input.trim()) { setOutput(""); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const r = await translate({ text: input, sourceLang: src, targetLang: tgt });
      if (r) {
        setOutput(r);
        setHistory(prev => [{ src, tgt, input, output: r, tone, ts: Date.now() }, ...prev.slice(0, 19)]);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [input, src, tgt, tone]);

  const swap = () => { setInput(output); setOutput(input); const t = src; setSrc(tgt); setTgt(t); };
  const clear = () => { setInput(""); setOutput(""); setCharCount(0); };

  const handleInput = (e) => { const v = e.target.value.slice(0, MAX_CHARS); setInput(v); setCharCount(v.length); };

  const srcLang = LANGUAGES.find(l => l.code === src);
  const tgtLang = LANGUAGES.find(l => l.code === tgt);

  return (
    <div className="tt-page">
      <div className="page-hero">
        <div className="inner">
          <span className="sec-tag tag-blue">📝 Text Translator</span>
          <h1>Translate Anything,<br /><span className="grad-text">Instantly</span></h1>
          <p>Paste or type text in any of 135 languages. Real-time neural AI translation with tone control and speech output.</p>
        </div>
      </div>

      <div className="tt-body">
        <div className="inner">
          {/* Lang Row */}
          <div className="tt-lang-row">
            <div className="lang-pill">
              <select value={src} onChange={e => setSrc(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
              </select>
            </div>
            <button className="swap-btn" onClick={swap} title="Swap languages">⇄</button>
            <div className="lang-pill">
              <select value={tgt} onChange={e => setTgt(e.target.value)}>
                {LANGUAGES.filter(l => l.code !== src).map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
              </select>
            </div>
          </div>

          {/* Translator Box */}
          <div className="tt-box">
            <div className="tt-side tt-in-side">
              <div className="tt-side-header">
                <span>{srcLang?.flag} {srcLang?.label}</span>
                <button className="btn-ghost" onClick={clear} style={{ fontSize: 12 }}>Clear ✕</button>
              </div>
              <textarea
                className="tt-textarea"
                value={input}
                onChange={handleInput}
                placeholder="Type or paste text to translate..."
                autoFocus
              />
              <div className="tt-side-footer">
                <span className={`char-count ${charCount > MAX_CHARS * 0.9 ? "warn" : ""}`}>{charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-ghost" onClick={() => speak(input, src)} title="Listen to original">🔊</button>
                  <button className="btn-ghost" onClick={() => navigator.clipboard?.readText().then(t => setInput(t))} title="Paste">📋 Paste</button>
                </div>
              </div>
            </div>

            <div className="tt-divider">
              {loading && <div className="tt-loading-indicator"><div className="spin-dot" /></div>}
            </div>

            <div className="tt-side tt-out-side">
              <div className="tt-side-header">
                <span>{tgtLang?.flag} {tgtLang?.label}</span>
                <span className="api-badge">⚡ AI</span>
              </div>
              <div className={`tt-output ${loading ? "translating" : ""}`}>
                {output || <span className="tt-placeholder">Translation appears here...</span>}
              </div>
              <div className="tt-side-footer">
                <div className="tone-group">
                  {TONES.map(t => <button key={t} className={`tone-btn ${tone === t ? "on" : ""}`} onClick={() => setTone(t)}>{t}</button>)}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-ghost" onClick={() => speak(output, tgt)} disabled={!output}>🔊</button>
                  <button className="btn-ghost" onClick={() => copyText(output, showToast)} disabled={!output}>📋 Copy</button>
                  <button className="btn-ghost" onClick={() => showToast("📌 Saved!")} disabled={!output}>📌</button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Lang Shortcuts */}
          <div className="quick-langs">
            <span className="ql-label">Quick switch:</span>
            {["es","fr","de","ja","ar","ur","zh","hi"].map(c => {
              const l = LANGUAGES.find(x => x.code === c);
              return <button key={c} className={`ql-btn ${tgt === c ? "on" : ""}`} onClick={() => setTgt(c)}>{l.flag} {l.label}</button>;
            })}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="tt-history">
              <button className="btn-ghost" onClick={() => setShowHistory(!showHistory)}>
                🕐 Recent translations ({history.length}) {showHistory ? "▲" : "▾"}
              </button>
              {showHistory && (
                <div className="history-list">
                  {history.map((h, i) => {
                    const sl = LANGUAGES.find(l => l.code === h.src);
                    const tl = LANGUAGES.find(l => l.code === h.tgt);
                    return (
                      <div key={i} className="history-item" onClick={() => { setInput(h.input); setOutput(h.output); setSrc(h.src); setTgt(h.tgt); }}>
                        <div className="hi-langs">{sl?.flag} {sl?.label} → {tl?.flag} {tl?.label}</div>
                        <div className="hi-text">{h.input.slice(0, 80)}{h.input.length > 80 ? "..." : ""}</div>
                        <div className="hi-tr">{h.output.slice(0, 80)}{h.output.length > 80 ? "..." : ""}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
