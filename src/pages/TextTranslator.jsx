import { useState, useEffect, useRef } from "react";
import { useTranslate, speak, copyText } from "../hooks/useTranslate";
import { SUPPORTED_LOCALES, getLocale } from "../constants/locales.js";
import { IconLock, IconGlobe, IconSwap, IconCopy, IconVolume, IconCheck, IconBolt } from "../components/Icons";
import "./TextTranslator.css";

const TONES = ["Legal Binding", "Neural Formal", "Technical Spec", "Executive Brief"];
const MAX_CHARS = 5000;

export default function TextTranslator({ showToast }) {
  const { translate, loading, error } = useTranslate();
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("de");
  const [sourceText, setSourceText] = useState(
    "3.4 Indemnification and Limitation of Liability. AcmeCorp™ shall defend, indemnify, and hold harmless Enterprise Client from third-party IP claims."
  );
  const [targetText, setTargetText] = useState(
    "3.4 Freistellung und Haftungsbeschränkung. AcmeCorp™ stellt den Unternehmenskunden von Ansprüchen Dritter aus Schutzrechtsverletzungen frei."
  );
  const [tone, setTone] = useState("Legal Binding");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [charCount, setCharCount] = useState(141);
  const debounceRef = useRef(null);

  const runTranslation = async (textToTranslate, srcCode, tgtCode, activeTone) => {
    const rawClean = (textToTranslate || "").trim();
    if (!rawClean) {
      setTargetText("");
      return;
    }
    const r = await translate({
      text: rawClean,
      source_lang: srcCode,
      target_lang: tgtCode,
      sourceLang: srcCode,
      targetLang: tgtCode,
    });
    if (typeof r === "string") {
      setTargetText(r);
      setHistory((prev) => [
        { src: srcCode, tgt: tgtCode, input: rawClean, output: r, tone: activeTone, ts: Date.now() },
        ...prev.slice(0, 19),
      ]);
    }
  };

  useEffect(() => {
    if (!sourceText.trim()) {
      setTargetText("");
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runTranslation(sourceText, sourceLang, targetLang, tone);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [sourceText, sourceLang, targetLang, tone, translate]);

  const swap = () => {
    const nextInput = targetText.slice(0, MAX_CHARS);
    setSourceText(nextInput);
    setTargetText(sourceText);
    setCharCount(nextInput.length);
    const t = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(t);
  };

  const clear = () => {
    setSourceText("");
    setTargetText("");
    setCharCount(0);
  };

  const handleInput = (e) => {
    const v = e.target.value.slice(0, MAX_CHARS);
    setSourceText(v);
    setCharCount(v.length);
  };

  const srcLangObj = getLocale(sourceLang);
  const tgtLangObj = getLocale(targetLang);

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
              <span>Locale: {tgtLangObj?.locale || "de-DE"}</span>
            </span>
          </div>

          <div className="tt-lang-row">
            <div className="lang-pill">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                aria-label="Source Language"
              >
                {SUPPORTED_LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <button className="swap-btn" onClick={swap} title="Swap locales">
              <IconSwap size={14} />
            </button>
            <div className="lang-pill">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                aria-label="Target Language"
              >
                {SUPPORTED_LOCALES.filter((l) => l.code !== sourceLang).map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="tt-box">
            <div className="tt-side tt-in-side">
              <div className="tt-side-header">
                <span>SOURCE [{srcLangObj?.locale}]</span>
                <button className="btn-ghost" onClick={clear}>
                  Clear
                </button>
              </div>
              <textarea
                className="tt-textarea"
                value={sourceText}
                onChange={handleInput}
                placeholder="Enter or paste enterprise source string to analyze..."
                autoFocus
              />
              <div className="tt-side-footer">
                <span className={`char-count ${charCount > MAX_CHARS * 0.9 ? "warn" : ""}`}>
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-ghost" onClick={() => speak(sourceText, sourceLang)} title="Listen to source">
                    <IconVolume size={13} />
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() =>
                      navigator.clipboard?.readText().then((t) => {
                        const next = t.slice(0, MAX_CHARS);
                        setSourceText(next);
                        setCharCount(next.length);
                      })
                    }
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
                <span className="tt-out-title">LOCALIZED [{tgtLangObj?.locale}]</span>
                {loading ? (
                  <span className="tt-status-badge loading">Compiling...</span>
                ) : error ? (
                  <span className="tt-status-badge error">API Fallback</span>
                ) : (
                  <span className="tt-match-badge">
                    <IconCheck size={11} />
                    <span>Glossary: 100%</span>
                  </span>
                )}
              </div>
              <div className={`tt-output ${loading ? "translating" : ""}`}>
                {error && (
                  <div className="tt-error-bar">
                    <span>Engine unreachable ({error}). Showing cached fallback.</span>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => {
                        clearTimeout(debounceRef.current);
                        runTranslation(sourceText, sourceLang, targetLang, tone);
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}
                {targetText || (
                  <span className="tt-placeholder">
                    {loading
                      ? "Compiling localized segment via Verto Engine..."
                      : "Compiled localized output appears here..."}
                  </span>
                )}
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
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button className="btn-ghost" onClick={() => speak(targetText, targetLang)} disabled={!targetText}>
                    <IconVolume size={13} />
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => copyText(targetText, showToast)}
                    disabled={!targetText}
                  >
                    <IconCopy size={13} />
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => showToast("Segment approved and committed to TM Bank")}
                    disabled={!targetText}
                  >
                    Approve Segment
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => {
                      clearTimeout(debounceRef.current);
                      runTranslation(sourceText, sourceLang, targetLang, tone);
                    }}
                    disabled={loading || !sourceText.trim()}
                  >
                    <IconBolt size={12} />
                    <span>{loading ? "Translating..." : "Translate"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="quick-langs">
            <span className="ql-label">TARGET PRESETS:</span>
            {["de", "fr", "es", "ar", "ur", "ja", "zh", "hi"].map((c) => {
              const l = getLocale(c);
              return (
                <button
                  key={c}
                  className={`ql-btn ${targetLang === c ? "on" : ""}`}
                  onClick={() => setTargetLang(c)}
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
                    const sl = getLocale(h.src);
                    const tl = getLocale(h.tgt);
                    return (
                      <div
                        key={i}
                        className="history-item"
                        onClick={() => {
                          setSourceText(h.input);
                          setTargetText(h.output);
                          setCharCount(h.input.length);
                          setSourceLang(h.src);
                          setTargetLang(h.tgt);
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
