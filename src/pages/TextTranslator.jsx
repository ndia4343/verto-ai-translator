import { useState, useEffect, useRef } from "react";
import { useTranslate, LANGUAGES, speak, copyText } from "../hooks/useTranslate";
import { IconLock, IconGlobe, IconSwap, IconCopy, IconVolume, IconCheck, IconBolt } from "../components/Icons";
import "./TextTranslator.css";

const TONES = ["Legal Binding", "Neural Formal", "Technical Spec", "Executive Brief"];
const MAX_CHARS = 5000;

export default function TextTranslator({ showToast }) {
  const { translate, loading } = useTranslate();
  const [src, setSrc] = useState("en");
  const [tgt, setTgt] = useState("de");
  const [input, setInput] = useState(
    "3.4 Indemnification and Limitation of Liability. AcmeCorp™ shall defend, indemnify, and hold harmless Enterprise Client from third-party IP claims."
  );
  const [output, setOutput] = useState(
    "3.4 Freistellung und Haftungsbeschränkung. AcmeCorp™ stellt den Unternehmenskunden von Ansprüchen Dritter aus Schutzrechtsverletzungen frei."
  );
  const [tone, setTone] = useState("Legal Binding");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [charCount, setCharCount] = useState(141);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const r = await translate({ text: input, sourceLang: src, targetLang: tgt });
      if (r) {
        setOutput(r);
        setHistory((prev) => [{ src, tgt, input, output: r, tone, ts: Date.now() }, ...prev.slice(0, 19)]);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [input, src, tgt, tone]);

  const swap = () => {
    setInput(output);
    setOutput(input);
    const t = src;
    setSrc(tgt);
    setTgt(t);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setCharCount(0);
  };

  const handleInput = (e) => {
    const v = e.target.value.slice(0, MAX_CHARS);
    setInput(v);
    setCharCount(v.length);
  };

  const srcLang = LANGUAGES.find((l) => l.code === src);
  const tgtLang = LANGUAGES.find((l) => l.code === tgt);

  return (
    <div className="tt-page">
      <div className="page-hero">
        <div className="inner">
          <span className="sec-tag">REAL-TIME DIFF WORKBENCH</span>
          <h1>Deterministic Segment Localization</h1>
          <p>
            Compile product strings, legal clauses, and technical manuals across 50+ locales while enforcing locked TM Bank rules.
          </p>
        </div>
      </div>

      <div className="tt-body">
        <div className="inner">
          <div className="tt-rules-bar">
            <span className="tt-rules-lbl">CONSTRAINTS</span>
            <span className="tt-rule-pill locked">
              <IconLock size={12} />
              <span>Term: AcmeCorp™</span>
            </span>
            <span className="tt-rule-pill tone">
              <IconBolt size={12} />
              <span>Tone: {tone}</span>
            </span>
            <span className="tt-rule-pill locale">
              <IconGlobe size={12} />
              <span>Locale: {tgtLang?.locale || "de-DE"}</span>
            </span>
          </div>

          <div className="tt-lang-row">
            <div className="lang-pill">
              <select value={src} onChange={(e) => setSrc(e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.locale} — {l.label}
                  </option>
                ))}
              </select>
            </div>
            <button className="swap-btn" onClick={swap} title="Swap locales">
              <IconSwap size={14} />
            </button>
            <div className="lang-pill">
              <select value={tgt} onChange={(e) => setTgt(e.target.value)}>
                {LANGUAGES.filter((l) => l.code !== src).map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.locale} — {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="tt-box">
            <div className="tt-side tt-in-side">
              <div className="tt-side-header">
                <span>SOURCE [{srcLang?.locale}]</span>
                <button className="btn-ghost" onClick={clear}>
                  Clear
                </button>
              </div>
              <textarea
                className="tt-textarea"
                value={input}
                onChange={handleInput}
                placeholder="Enter source segment..."
                autoFocus
              />
              <div className="tt-side-footer">
                <span className={`char-count ${charCount > MAX_CHARS * 0.9 ? "warn" : ""}`}>
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-ghost" onClick={() => speak(input, src)} title="Listen to source">
                    <IconVolume size={13} />
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => navigator.clipboard?.readText().then((t) => setInput(t))}
                  >
                    Paste
                  </button>
                </div>
              </div>
            </div>

            <div className="tt-divider">
              {loading && (
                <div className="tt-loading-indicator">
                  <div className="spin-dot" />
                </div>
              )}
            </div>

            <div className="tt-side tt-out-side">
              <div className="tt-side-header">
                <span className="tt-out-title">LOCALIZED [{tgtLang?.locale}]</span>
                <span className="tt-match-badge">
                  <IconCheck size={11} />
                  <span>Glossary: 100%</span>
                </span>
              </div>
              <div className={`tt-output ${loading ? "translating" : ""}`}>
                {output || <span className="tt-placeholder">Compiled localized output appears here...</span>}
              </div>
              <div className="tt-side-footer">
                <div className="tone-group">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      className={`tone-btn ${tone === t ? "on" : ""}`}
                      onClick={() => setTone(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-ghost" onClick={() => speak(output, tgt)} disabled={!output}>
                    <IconVolume size={13} />
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => copyText(output, showToast)}
                    disabled={!output}
                  >
                    <IconCopy size={13} />
                    <span>Copy</span>
                  </button>
                  <button
                    className="btn-primary"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => showToast("Segment approved and committed to TM Bank")}
                    disabled={!output}
                  >
                    Approve Segment
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="quick-langs">
            <span className="ql-label">TARGET PRESETS:</span>
            {["de", "fr", "es", "ja", "it", "nl", "pt", "zh"].map((c) => {
              const l = LANGUAGES.find((x) => x.code === c);
              return (
                <button
                  key={c}
                  className={`ql-btn ${tgt === c ? "on" : ""}`}
                  onClick={() => setTgt(c)}
                >
                  {l.locale}
                </button>
              );
            })}
          </div>

          {history.length > 0 && (
            <div className="tt-history">
              <button className="btn-ghost" onClick={() => setShowHistory(!showHistory)}>
                Compiled segment history ({history.length}) {showHistory ? "▴" : "▾"}
              </button>
              {showHistory && (
                <div className="history-list">
                  {history.map((h, i) => {
                    const sl = LANGUAGES.find((l) => l.code === h.src);
                    const tl = LANGUAGES.find((l) => l.code === h.tgt);
                    return (
                      <div
                        key={i}
                        className="history-item"
                        onClick={() => {
                          setInput(h.input);
                          setOutput(h.output);
                          setSrc(h.src);
                          setTgt(h.tgt);
                        }}
                      >
                        <div className="hi-langs">
                          {sl?.locale} → {tl?.locale} · {h.tone}
                        </div>
                        <div className="hi-text">
                          {h.input.slice(0, 90)}
                          {h.input.length > 90 ? "..." : ""}
                        </div>
                        <div className="hi-tr">
                          {h.output.slice(0, 90)}
                          {h.output.length > 90 ? "..." : ""}
                        </div>
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
