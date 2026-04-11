import { useState, useRef, useEffect } from "react";
import { useTranslate, LANGUAGES, speak } from "../hooks/useTranslate";
import "./VoicePage.css";

export default function VoicePage({ showToast }) {
  const { translate } = useTranslate();
  const [srcL, setSrcL] = useState("en");
  const [tgtL, setTgtL] = useState("es");
  const [listening, setListening] = useState(false);
  const [lines, setLines] = useState([]);
  const [status, setStatus] = useState("Tap the microphone to start speaking");
  const [supported, setSupported] = useState(true);
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => stopListening();
  }, []);

  const animateVolume = () => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setVolume(Math.min(avg / 100, 1));
    animRef.current = requestAnimationFrame(animateVolume);
  };

  const startListening = async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast("❌ Speech recognition not supported in this browser"); return; }

    // Try microphone + audio visualization
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;
      audioCtxRef.current = ctx;
      animateVolume();
    } catch {}

    const recognition = new SR();
    recognition.lang = srcL;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => { setListening(true); setStatus("🔴 Listening... Speak now"); };
    recognition.onend = () => { setListening(false); setStatus("Tap the microphone to start speaking"); setVolume(0); cancelAnimationFrame(animRef.current); };

    recognition.onresult = async (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      if (e.results[e.results.length - 1].isFinal && transcript.trim()) {
        setStatus("⏳ Translating...");
        const r = await translate({ text: transcript, sourceLang: srcL, targetLang: tgtL });
        if (r) {
          const newLine = { src: transcript, tgt: r, srcL, tgtL };
          setLines(prev => [...prev, newLine]);
          speak(r, tgtL);
          setStatus("✅ Done — tap mic to continue");
        }
      }
    };

    recognition.onerror = (e) => { setStatus(`❌ ${e.error === "no-speech" ? "No speech detected" : e.error}`); setListening(false); };
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    cancelAnimationFrame(animRef.current);
    audioCtxRef.current?.close().catch(() => {});
    setListening(false); setVolume(0);
  };

  const toggle = () => { listening ? stopListening() : startListening(); };
  const swap = () => { const t = srcL; setSrcL(tgtL); setTgtL(t); };
  const clear = () => setLines([]);

  return (
    <div className="voice-page">
      <div className="page-hero">
        <div className="inner">
          <span className="sec-tag tag-violet">🎙️ Voice Translator</span>
          <h1>Speak. <span className="grad-text">Translated.</span><br />Instantly.</h1>
          <p>Real-time voice-to-translation using your microphone. Speak in any language, hear the translation automatically.</p>
        </div>
      </div>

      <div className="voice-body">
        <div className="inner" style={{ maxWidth: 680, margin: "0 auto" }}>
          {/* Lang selector */}
          <div className="v-lang-row">
            <div className="vlb">
              <label>Speaking</label>
              <select className="inp" value={srcL} onChange={e => setSrcL(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
              </select>
            </div>
            <button className="swap-btn" onClick={swap}>⇄</button>
            <div className="vlb">
              <label>Translate to</label>
              <select className="inp" value={tgtL} onChange={e => setTgtL(e.target.value)}>
                {LANGUAGES.filter(l => l.code !== srcL).map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
              </select>
            </div>
          </div>

          {/* Mic */}
          <div className="mic-center">
            {!supported ? (
              <div className="unsupported-box">
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Browser not supported</div>
                <div style={{ fontSize: 13.5, color: "var(--text3)" }}>Use Chrome, Edge, or Safari for voice translation.</div>
              </div>
            ) : (
              <>
                <div className="mic-rings">
                  {[1,2,3].map(i => <div key={i} className={`mic-ring mic-ring-${i} ${listening ? "active" : ""}`} style={listening ? { transform: `scale(${1 + volume * i * 0.3})` } : {}} />)}
                  <button className={`big-mic ${listening ? "rec" : ""}`} onClick={toggle} aria-label={listening ? "Stop" : "Start"}>
                    {listening ? "⏹" : "🎙️"}
                  </button>
                </div>
                <div className="mic-status-txt">{status}</div>
                {listening && (
                  <div className="wave-bars">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.08}s`, height: `${20 + Math.random() * 40}%` }} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Transcript */}
          <div className="v-transcript-box">
            <div className="vt-header">
              <span style={{ fontWeight: 700, fontSize: 14 }}>Conversation</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-ghost" onClick={() => { lines.forEach(l => speak(l.tgt, l.tgtL)); }}>🔊 Replay all</button>
                <button className="btn-ghost" onClick={clear}>🗑 Clear</button>
              </div>
            </div>
            <div className="vt-content">
              {lines.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text3)", padding: "28px 0", fontSize: 14 }}>Your conversation appears here...</div>
              ) : lines.map((line, i) => {
                const sL = LANGUAGES.find(l => l.code === line.srcL);
                const tL = LANGUAGES.find(l => l.code === line.tgtL);
                return (
                  <div key={i} className="vt-line fade-in">
                    <div className="vt-src">
                      <div className="vt-lbl">{sL?.flag} You ({sL?.label})</div>
                      <div className="vt-text">{line.src}</div>
                    </div>
                    <div className="vt-tgt">
                      <div className="vt-lbl">{tL?.flag} Translation ({tL?.label})</div>
                      <div className="vt-text vt-text-accent">{line.tgt}</div>
                      <button className="btn-ghost" style={{ fontSize: 12, marginTop: 6 }} onClick={() => speak(line.tgt, line.tgtL)}>🔊 Listen</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="voice-tips">
            <div className="tip">🎧 Use headphones to prevent echo</div>
            <div className="tip">🗣️ Speak clearly and at normal pace</div>
            <div className="tip">📶 Works best with a stable connection</div>
          </div>
        </div>
      </div>
    </div>
  );
}
