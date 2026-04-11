import { useState, useEffect } from "react";
import { useTranslate, LANGUAGES, speak, copyText } from "../hooks/useTranslate";
import "./Home.css";

const STATS = [{ n: "135+", l: "Languages" }, { n: "99.2%", l: "Accuracy" }, { n: "200K+", l: "Users" }, { n: "<0.3s", l: "Response" }];
const TRUST = ["Travellers", "Educators", "Remote Teams", "Tour Guides", "Freelancers", "Students", "Diplomats"];

const FEATURES = [
  { id: "text", icon: "📝", name: "Text Translator", sub: "135 languages, real-time" },
  { id: "camera", icon: "📸", name: "Camera Translator", sub: "Point & tap to translate" },
  { id: "voice", icon: "🎙️", name: "Voice Translator", sub: "Live bilingual speech" },
  { id: "document", icon: "📄", name: "Document Translator", sub: "PDF, DOCX, PPTX" },
  { id: "phrases", icon: "📌", name: "Phrasebook", sub: "Save & organize phrases" },
];

const SAMPLE_PHRASES = [
  { e: "Good morning!", t: "¡Buenos días!", flag: "🇪🇸", cat: "Greetings", color: "#00d4ff" },
  { e: "Where is the restaurant?", t: "¿Dónde está el restaurante?", flag: "🇪🇸", cat: "Travel", color: "#7b4fff" },
  { e: "How much is this?", t: "Quanto costa questo?", flag: "🇮🇹", cat: "Shopping", color: "#80f0d8" },
  { e: "I need help.", t: "J'ai besoin d'aide.", flag: "🇫🇷", cat: "Emergency", color: "#ffe8a0" },
];

const VOICE_SAMPLES = [
  { s: "Good morning! Do you have a table for two?", t: "¡Buenos días! ¿Tiene una mesa para dos?" },
  { s: "How do I get to the city centre?", t: "¿Cómo llego al centro de la ciudad?" },
  { s: "What is the wifi password?", t: "¿Cuál es la contraseña del wifi?" },
  { s: "Can I pay by card?", t: "¿Puedo pagar con tarjeta?" },
];

export default function Home({ setPage, showToast }) {
  const { translate, loading } = useTranslate();
  const [heroSrc, setHeroSrc] = useState("en");
  const [heroTgt, setHeroTgt] = useState("es");
  const [heroText, setHeroText] = useState("Good morning! How can I help you?");
  const [heroOut, setHeroOut] = useState("¡Buenos días! ¿En qué puedo ayudarte?");
  const [activeFeat, setActiveFeat] = useState("text");
  const [ftText, setFtText] = useState("Hello, how are you today?");
  const [ftOut, setFtOut] = useState("¡Hola, cómo estás hoy?");
  const [ftSrc, setFtSrc] = useState("en"); const [ftTgt, setFtTgt] = useState("es");
  const [ftTone, setFtTone] = useState("Formal");
  const [prevTab, setPrevTab] = useState("text");
  const [camWord, setCamWord] = useState("");
  const [camOut, setCamOut] = useState("👆 Tap a sign");
  const [docProgress, setDocProgress] = useState(0); const [docDone, setDocDone] = useState(false); const [docRunning, setDocRunning] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false); const [voiceLines, setVoiceLines] = useState([]); const [voiceSrcL, setVoiceSrcL] = useState("en"); const [voiceTgtL, setVoiceTgtL] = useState("es");
  const [savedPhrases, setSavedPhrases] = useState(new Set());
  const [debounce, setDebounce] = useState(null);

  const doHeroTrans = async (text, tgt) => {
    if (!text.trim()) { setHeroOut(""); return; }
    setHeroOut("⏳ Translating...");
    const r = await translate({ text, sourceLang: heroSrc, targetLang: tgt || heroTgt });
    if (r) setHeroOut(r);
  };

  useEffect(() => {
    clearTimeout(debounce);
    const t = setTimeout(() => doHeroTrans(heroText, heroTgt), 500);
    setDebounce(t);
    return () => clearTimeout(t);
  }, [heroText, heroTgt]);

  const hSwap = () => { setHeroText(heroOut); setHeroOut(heroText); const t = heroSrc; setHeroSrc(heroTgt); setHeroTgt(t); };

  const doFtTrans = async (text, tgt) => {
    if (!text.trim()) { setFtOut(""); return; }
    const r = await translate({ text, sourceLang: ftSrc, targetLang: tgt || ftTgt });
    if (r) setFtOut(r);
  };

  useEffect(() => {
    clearTimeout(debounce);
    const t = setTimeout(() => doFtTrans(ftText, ftTgt), 400);
    setDebounce(t);
    return () => clearTimeout(t);
  }, [ftText, ftTgt]);

  const ftSwap = () => { setFtText(ftOut); setFtOut(ftText); };

  const handleCamSign = (orig, trans) => { setCamOut(`${orig} → ${trans}`); setCamWord(trans); };

  const runDocUpload = () => {
    if (docRunning) return;
    setDocRunning(true); setDocDone(false); setDocProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 4; setDocProgress(Math.min(p, 100));
      if (p >= 100) { clearInterval(iv); setDocDone(true); setDocRunning(false); }
    }, 70);
  };

  let voiceTimer;
  const toggleVoice = () => {
    if (voiceOn) { setVoiceOn(false); clearTimeout(voiceTimer); return; }
    setVoiceOn(true);
    voiceTimer = setTimeout(() => {
      setVoiceOn(false);
      const s = VOICE_SAMPLES[voiceLines.length % VOICE_SAMPLES.length];
      setVoiceLines(prev => [...prev, s]);
    }, 2500);
  };

  const togglePhrase = (i) => {
    setSavedPhrases(prev => { const next = new Set(prev); if (next.has(i)) next.delete(i); else { next.add(i); showToast("📌 Saved!"); } return next; });
  };

  const SIGNS = [
    { text: "Ristorante", trans: "Restaurant (Italian)", style: { top: "18px", left: "18px", background: "#8B0000", color: "#fff" } },
    { text: "SORTIE", trans: "Exit (French)", style: { top: "56px", right: "18px", background: "#0D47A1", color: "#fff" } },
    { text: "Apotheke", trans: "Pharmacy (German)", style: { top: "100px", left: "38px", background: "#1B5E20", color: "#fff", fontSize: "11px" } },
    { text: "Métro →", trans: "Subway (French)", style: { bottom: "80px", left: "18px", background: "#4A148C", color: "#fff" } },
    { text: "Achtung!", trans: "Warning (German)", style: { bottom: "50px", right: "18px", background: "#E65100", color: "#fff", fontSize: "11px" } },
    { text: "Café du Marché", trans: "Market Café (French)", style: { bottom: "18px", left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.92)", color: "#000", whiteSpace: "nowrap", fontSize: "11px" } },
  ];

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left fade-up">
            <div className="hero-badge">🌐 AI-Powered · 135 Languages · Real-time</div>
            <h1>Break Every<br /><span className="grad-text">Language</span><br />Barrier</h1>
            <p>Neural AI translation for text, voice, camera and documents. Built for travellers, professionals and global teams who communicate without limits.</p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => setPage("camera-translator")}>📸 Try Camera</button>
              <button className="btn-outline" onClick={() => setPage("pricing")}>View Pricing →</button>
            </div>
            <div className="hero-stats">
              {STATS.map(s => <div key={s.l} className="hs"><div className="hs-n">{s.n}</div><div className="hs-l">{s.l}</div></div>)}
            </div>
          </div>
          <div className="hero-card fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="hc-label"><div className="hc-dot" />Live Translator <span className="api-badge">API</span></div>
            <div className="hc-row">
              <select className="hc-sel" value={heroSrc} onChange={e => setHeroSrc(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
              </select>
              <button className="hc-swap" onClick={hSwap} title="Swap languages">⇄</button>
              <select className="hc-sel" value={heroTgt} onChange={e => setHeroTgt(e.target.value)}>
                {LANGUAGES.filter(l => l.code !== heroSrc).map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
              </select>
            </div>
            <textarea className="hc-in" value={heroText} onChange={e => setHeroText(e.target.value)} placeholder="Type to translate..." />
            <div className={`hc-out ${loading ? "translating" : ""}`}>{heroOut || <span style={{ opacity: 0.4 }}>Translation appears here...</span>}</div>
            <div className="hc-actions">
              <button className="btn-ghost" onClick={() => speak(heroOut, heroTgt)}>🔊 Listen</button>
              <button className="btn-ghost" onClick={() => copyText(heroOut, showToast)}>📋 Copy</button>
              <button className="btn-ghost" onClick={() => setPage("text-translator")}>↗ Full Editor</button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <div className="trust-bar">
        <div className="trust-label">Built for</div>
        <div className="trust-logos">{TRUST.map(t => <span key={t} className="tl">{t}</span>)}</div>
      </div>

      {/* FEATURES */}
      <section className="section feat-section">
        <div className="inner">
          <span className="sec-tag tag-blue">Features</span>
          <h2 className="sec-h">Everything to communicate globally</h2>
          <p className="sec-p">Click any feature to see it live in action — no download needed.</p>
          <div className="feat-layout">
            <div className="feat-list">
              {FEATURES.map(f => (
                <div key={f.id} className={`feat-tab ${activeFeat === f.id ? "on" : ""}`} onClick={() => setActiveFeat(f.id)}>
                  <div className="ft-ico">{f.icon}</div>
                  <div><div className="ft-name">{f.name}</div><div className="ft-sub">{f.sub}</div></div>
                </div>
              ))}
            </div>
            <div className="feat-panel">
              {/* TEXT FEATURE */}
              {activeFeat === "text" && (
                <div className="fp fade-in">
                  <div className="fp-header"><div className="fp-ico">📝</div><div><div className="fp-title">Text Translator</div><p className="fp-desc">Real-time AI translation across 135 languages with tone control, speech output, and instant clipboard copy.</p></div></div>
                  <div className="demo-grid">
                    <div>
                      <select className="inp" value={ftSrc} onChange={e => setFtSrc(e.target.value)} style={{ marginBottom: 8 }}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                      </select>
                      <textarea className="demo-ta" value={ftText} onChange={e => setFtText(e.target.value)} placeholder="Enter text..." />
                    </div>
                    <button className="swap-btn" onClick={ftSwap}>⇄</button>
                    <div>
                      <select className="inp" value={ftTgt} onChange={e => setFtTgt(e.target.value)} style={{ marginBottom: 8 }}>
                        {LANGUAGES.filter(l => l.code !== ftSrc).map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                      </select>
                      <div className="demo-out">{ftOut || <span style={{ opacity: 0.4 }}>Translation appears here...</span>}</div>
                    </div>
                  </div>
                  <div className="demo-footer">
                    <div className="tone-group">
                      {["Formal","Casual","Business"].map(t => <button key={t} className={`tone-btn ${ftTone === t ? "on" : ""}`} onClick={() => setFtTone(t)}>{t}</button>)}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-ghost" onClick={() => speak(ftOut, ftTgt)}>🔊</button>
                      <button className="btn-ghost" onClick={() => copyText(ftOut, showToast)}>📋 Copy</button>
                      <button className="btn-ghost" onClick={() => showToast("📌 Saved!")}>📌</button>
                    </div>
                  </div>
                  <span className="api-badge" style={{ marginTop: 10, display: "inline-flex" }}>⚡ Powered by DeepL + GPT-4</span>
                </div>
              )}
              {/* CAMERA FEATURE */}
              {activeFeat === "camera" && (
                <div className="fp fade-in">
                  <div className="fp-header"><div className="fp-ico">📸</div><div><div className="fp-title">Camera Translator</div><p className="fp-desc">Point your camera at any text in the real world and tap to translate instantly. Works on signs, menus, labels, and more.</p></div></div>
                  <div className="cam-phone">
                    <div className="cam-hdr"><span>📸 LinguaFlow Cam</span><div style={{ display: "flex", gap: 6 }}><button className="cam-btn-z" onClick={() => {}}>1×</button><button className="cam-btn-s" onClick={() => setCamOut("⚡ 6 elements found — tap each")}>⚡ Scan</button></div></div>
                    <div className="cam-view">
                      <div className="cam-bg" />
                      {SIGNS.map((s, i) => (
                        <div key={i} className="sign-label" style={s.style} onClick={() => { handleCamSign(s.text, s.trans); }}>
                          {s.text}
                        </div>
                      ))}
                      <div className="scan-frame"><span className="sc tl"/><span className="sc tr"/><span className="sc bl"/><span className="sc br"/><div className="scan-line" /></div>
                    </div>
                    <div className="cam-result">
                      <div className="cam-rl">Translation</div>
                      <div className="cam-rt">{camOut}</div>
                      <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
                        <button style={{ flex: 1, padding: "7px", borderRadius: "6px", border: "none", background: "#252525", color: "#eee", fontSize: "12px", fontWeight: 700, cursor: "pointer" }} onClick={() => copyText(camWord, showToast)}>📋 Copy</button>
                        <button style={{ flex: 1, padding: "7px", borderRadius: "6px", border: "none", background: "#0582ca", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }} onClick={() => speak(camWord)}>🔊 Listen</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* VOICE FEATURE */}
              {activeFeat === "voice" && (
                <div className="fp fade-in">
                  <div className="fp-header"><div className="fp-ico">🎙️</div><div><div className="fp-title">Voice Translator</div><p className="fp-desc">Speak naturally and hear real-time translations. Perfect for conversations, travel, and business meetings.</p></div></div>
                  <div className="voice-demo">
                    <div className="v-langs">
                      <select className="inp" value={voiceSrcL} onChange={e => setVoiceSrcL(e.target.value)}>
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                      </select>
                      <button className="swap-btn" onClick={() => { const t = voiceSrcL; setVoiceSrcL(voiceTgtL); setVoiceTgtL(t); }}>⇄</button>
                      <select className="inp" value={voiceTgtL} onChange={e => setVoiceTgtL(e.target.value)}>
                        {LANGUAGES.filter(l => l.code !== voiceSrcL).map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                      </select>
                    </div>
                    <button className={`mic-btn ${voiceOn ? "rec" : ""}`} onClick={toggleVoice}>{voiceOn ? "⏹" : "🎙️"}</button>
                    <div className="mic-status">{voiceOn ? "🔴 Listening..." : "Tap mic to speak"}</div>
                    <div className="v-transcript">
                      {voiceLines.length === 0 ? <p style={{ textAlign: "center", color: "var(--text3)", fontSize: 14 }}>Your conversation appears here...</p> : voiceLines.map((line, i) => (
                        <div key={i} className="vt-row">
                          <div className="vt-src"><div className="vt-lbl">You ({voiceSrcL.toUpperCase()})</div>{line.s}</div>
                          <div className="vt-res"><div className="vt-lbl">Translated ({voiceTgtL.toUpperCase()})</div>{line.t}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button className="btn-ghost" onClick={() => { const s = VOICE_SAMPLES[voiceLines.length % VOICE_SAMPLES.length]; setVoiceLines(prev => [...prev, s]); }}>➕ Try Sample</button>
                      <button className="btn-ghost" onClick={() => setVoiceLines([])}>🗑 Clear</button>
                    </div>
                  </div>
                </div>
              )}
              {/* DOCUMENT FEATURE */}
              {activeFeat === "document" && (
                <div className="fp fade-in">
                  <div className="fp-header"><div className="fp-ico">📄</div><div><div className="fp-title">Document Translator</div><p className="fp-desc">Upload PDFs, Word docs, PowerPoints, and spreadsheets. Get fully translated files preserving original formatting.</p></div></div>
                  {!docRunning && !docDone ? (
                    <div className="doc-drop" onClick={runDocUpload} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); runDocUpload(); }}>
                      <div style={{ fontSize: 44 }}>📄</div>
                      <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Drop document or click to browse</div>
                      <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 14 }}>PDF, DOCX, PPTX, XLSX · Up to 100 MB</div>
                      <button className="btn-primary">Browse Files</button>
                    </div>
                  ) : (
                    <div className="doc-progress-card">
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <div style={{ fontSize: 32 }}>📄</div>
                        <div><div style={{ fontWeight: 700 }}>contract_2024.pdf</div><div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>English → Spanish · 12 pages</div></div>
                      </div>
                      <div className="prog-track"><div className="prog-bar" style={{ width: `${docProgress}%` }} /></div>
                      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 5 }}>{docProgress}%</div>
                      {docDone && <><div className="doc-result">"ACUERDO DE SERVICIOS PROFESIONALES — Este Acuerdo se celebra entre LinguaFlow Inc. y el cliente..."</div><button className="btn-primary" style={{ width: "100%", marginTop: 12 }} onClick={() => showToast("⬇ Download started!")}>⬇ Download Translated</button></>}
                    </div>
                  )}
                </div>
              )}
              {/* PHRASES FEATURE */}
              {activeFeat === "phrases" && (
                <div className="fp fade-in">
                  <div className="fp-header"><div className="fp-ico">📌</div><div><div className="fp-title">Phrasebook</div><p className="fp-desc">Save, organize and replay your most-used phrases. Perfect for travel prep and language learning.</p></div></div>
                  <div className="phrase-demo-grid">
                    {SAMPLE_PHRASES.map((p, i) => (
                      <div key={i} className={`ph-card ${savedPhrases.has(i) ? "saved" : ""}`}>
                        <div className="ph-flag">{p.flag}</div>
                        <div className="ph-cat" style={{ color: p.color }}>{p.cat}</div>
                        <div className="ph-en">{p.e}</div>
                        <div className="ph-tr">{p.t}</div>
                        <div className="ph-actions">
                          <button className="btn-ghost" onClick={() => togglePhrase(i)}>{savedPhrases.has(i) ? "✓ Saved" : "+ Save"}</button>
                          <button className="btn-ghost" onClick={() => speak(p.t)}>🔊</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12.5, color: "var(--text3)" }}>{savedPhrases.size} phrases saved</span>
                    <button className="btn-ghost" onClick={() => setPage("phrasebook")}>View all phrases →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING CTA */}
      <section className="section cta-section">
        <div className="inner">
          <div className="cta-card">
            <div className="cta-badge">🚀 Limited time — Save 25%</div>
            <h2 className="sec-h ctr" style={{ color: "#fff" }}>Start translating free today</h2>
            <p className="ctr" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 32, marginTop: 12 }}>No credit card required. 50 free translations daily.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-main-cta" onClick={() => setPage("pricing")}>Get started free →</button>
              <button className="btn-out-cta" onClick={() => setPage("text-translator")}>Try translator</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="inner">
          <div className="foot-grid">
            <div className="foot-brand">
              <div className="nav-logo" style={{ marginBottom: 14 }}>
                <div className="nav-mark">LF</div>
                <span className="nav-name">LinguaFlow</span>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--text3)", lineHeight: 1.75, maxWidth: 240 }}>AI-powered translation for the world. Break every language barrier.</p>
            </div>
            {[
              { title: "Products", links: [{ l: "Text Translator", id: "text-translator" }, { l: "Camera Translator", id: "camera-translator" }, { l: "Document Translator", id: "document-translator" }, { l: "Voice Translator", id: "voice" }] },
              { title: "Company", links: [{ l: "Pricing", id: "pricing" }, { l: "Phrasebook", id: "phrasebook" }] },
            ].map(col => (
              <div key={col.title} className="foot-col">
                <div className="foot-title">{col.title}</div>
                {col.links.map(l => <div key={l.l} className="foot-link" onClick={() => setPage(l.id)}>{l.l}</div>)}
              </div>
            ))}
          </div>
          <div className="foot-bottom">
            <span>© 2025 LinguaFlow. All rights reserved.</span>
            <span>Privacy · Terms · Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
