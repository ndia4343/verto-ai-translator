import { useState, useRef, useEffect } from "react";
import { useTranslate, LANGUAGES, speak } from "../hooks/useTranslate";
import { IconMic, IconSwap, IconVolume } from "../components/Icons";
import "./VoicePage.css";

export default function VoicePage({ showToast }) {
  const { translate } = useTranslate();
  const [srcL, setSrcL] = useState("en");
  const [tgtL, setTgtL] = useState("de");
  const [listening, setListening] = useState(false);
  const [lines, setLines] = useState([]);
  const [status, setStatus] = useState("Audio capture ready · Zero Retention active");
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
    if (!SR) {
      showToast("Speech capture requires Chrome, Edge, or Safari");
      return;
    }

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

    recognition.onstart = () => {
      setListening(true);
      setStatus("Capturing live audio stream...");
    };
    recognition.onend = () => {
      setListening(false);
      setStatus("Audio capture ready · Zero Retention active");
      setVolume(0);
      cancelAnimationFrame(animRef.current);
    };

    recognition.onresult = async (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      if (e.results[e.results.length - 1].isFinal && transcript.trim()) {
        setStatus("Compiling localized segment...");
        const r = await translate({ text: transcript, sourceLang: srcL, targetLang: tgtL });
        if (typeof r === "string" && r) {
          setLines((prev) => [...prev, { src: transcript, tgt: r, srcL, tgtL }]);
          speak(r, tgtL);
          setStatus("Segment logged to transcript");
        } else if (r === null) {
          setStatus("Translation service unavailable");
        }
      }
    };

    recognition.onerror = (e) => {
      setStatus(e.error === "no-speech" ? "No speech detected" : `Audio error: ${e.error}`);
      setListening(false);
    };
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    cancelAnimationFrame(animRef.current);
    audioCtxRef.current?.close().catch(() => {});
    setListening(false);
    setVolume(0);
  };

  const toggle = () => (listening ? stopListening() : startListening());
  const swap = () => {
    const t = srcL;
    setSrcL(tgtL);
    setTgtL(t);
  };

  return (
    <div className="voice-page">
      <div className="page-hero">
        <div className="inner">
          <span className="sec-tag">REAL-TIME MEDIA STREAM</span>
          <h1>Briefing &amp; Audio Localization</h1>
          <p>
            Capture live compliance briefings and executive sessions with real-time bilingual transcription and TM Bank glossary locking.
          </p>
        </div>
      </div>

      <div className="voice-body">
        <div className="inner" style={{ maxWidth: 740 }}>
          <div className="v-lang-row">
            <div className="vlb">
              <label>SOURCE LOCALE</label>
              <select className="inp" value={srcL} onChange={(e) => setSrcL(e.target.value)}>
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
            <div className="vlb">
              <label>TARGET LOCALE</label>
              <select className="inp" value={tgtL} onChange={(e) => setTgtL(e.target.value)}>
                {LANGUAGES.filter((l) => l.code !== srcL).map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.locale} — {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mic-center">
            {!supported ? (
              <div className="unsupported-box">
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Web Speech API unavailable</div>
                <div style={{ fontSize: 13, color: "rgba(254,250,224,0.6)" }}>
                  Use Chrome, Edge, or Safari to capture live audio briefings.
                </div>
              </div>
            ) : (
              <>
                <div className="mic-rings">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`mic-ring mic-ring-${i} ${listening ? "active" : ""}`}
                      style={listening ? { transform: `scale(${1 + volume * i * 0.25})` } : {}}
                    />
                  ))}
                  <button
                    className={`big-mic ${listening ? "rec" : ""}`}
                    onClick={toggle}
                    aria-label={listening ? "Stop capture" : "Start capture"}
                  >
                    <IconMic size={26} />
                  </button>
                </div>
                <div className="mic-status-txt">{status}</div>
                {listening && (
                  <div className="wave-bars">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="wave-bar"
                        style={{ animationDelay: `${i * 0.08}s`, height: `${28 + (i % 4) * 14}%` }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="v-transcript-box">
            <div className="vt-header">
              <span>SESSION TRANSCRIPT LOG</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn-ghost"
                  onClick={() => lines.forEach((l) => speak(l.tgt, l.tgtL))}
                  disabled={lines.length === 0}
                >
                  <IconVolume size={13} />
                  <span>Replay all</span>
                </button>
                <button className="btn-ghost" onClick={() => setLines([])}>
                  Clear
                </button>
              </div>
            </div>
            <div className="vt-content">
              {lines.length === 0 ? (
                <div style={{ textAlign: "center", color: "rgba(254,250,224,0.5)", padding: "28px 0", fontSize: 13, fontFamily: "var(--mono)" }}>
                  Captured audio segments and localized diffs appear here.
                </div>
              ) : (
                lines.map((line, i) => {
                  const sL = LANGUAGES.find((l) => l.code === line.srcL);
                  const tL = LANGUAGES.find((l) => l.code === line.tgtL);
                  return (
                    <div key={i} className="vt-line fade-in">
                      <div className="vt-src">
                        <div className="vt-lbl">SOURCE [{sL?.locale}]</div>
                        <div className="vt-text">{line.src}</div>
                      </div>
                      <div className="vt-tgt">
                        <div className="vt-lbl">LOCALIZED [{tL?.locale}]</div>
                        <div className="vt-text vt-text-accent">{line.tgt}</div>
                        <button
                          className="btn-ghost"
                          style={{ marginTop: 8 }}
                          onClick={() => speak(line.tgt, line.tgtL)}
                        >
                          <IconVolume size={12} />
                          <span>Synthesize</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="voice-tips">
            <div className="tip">AES-GCM encrypted transport</div>
            <div className="tip">Zero audio payload retention</div>
            <div className="tip">TM Bank terminology enforced</div>
          </div>
        </div>
      </div>
    </div>
  );
}
