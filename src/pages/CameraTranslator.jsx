import { useState, useRef, useEffect } from "react";
import { useTranslate, LANGUAGES, speak, copyText } from "../hooks/useTranslate";
import "./CameraTranslator.css";

const DEMO_SIGNS = [
  { text: "Ristorante", trans: "Restaurant", from: "Italian", style: { top: "20px", left: "20px", background: "#8B0000", color: "#fff" } },
  { text: "SORTIE", trans: "Exit", from: "French", style: { top: "60px", right: "20px", background: "#0D47A1", color: "#fff" } },
  { text: "Apotheke", trans: "Pharmacy", from: "German", style: { top: "105px", left: "40px", background: "#1B5E20", color: "#fff", fontSize: "11px" } },
  { text: "Métro →", trans: "Subway", from: "French", style: { bottom: "80px", left: "20px", background: "#4A148C", color: "#fff" } },
  { text: "Achtung!", trans: "Warning!", from: "German", style: { bottom: "50px", right: "20px", background: "#E65100", color: "#fff", fontSize: "11px" } },
  { text: "Café du Marché", trans: "Market Café", from: "French", style: { bottom: "20px", left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.92)", color: "#000", whiteSpace: "nowrap", fontSize: "11px" } },
  { text: "대출", trans: "Loan", from: "Korean", style: { top: "140px", right: "20px", background: "#006064", color: "#fff", fontSize: "13px" } },
];

export default function CameraTranslator({ showToast }) {
  const { translate } = useTranslate();
  const [tgtL, setTgtL] = useState("en");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [translation, setTranslation] = useState({ src: "", tgt: "", lang: "" });
  const [zoom, setZoom] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraActive(true); setCameraError(null);
    } catch (e) {
      setCameraError(e.name === "NotAllowedError" ? "Camera permission denied. Please allow camera access." : e.name === "NotFoundError" ? "No camera found on this device." : e.message);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  useEffect(() => { return () => stopCamera(); }, []);

  const captureAndTranslate = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setScanning(true);
    const token = localStorage.getItem("lf_token");
    const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
    try {
      canvas.toBlob(async (blob) => {
        const form = new FormData();
        form.append("image", blob, "capture.jpg");
        form.append("targetLang", tgtL);
        const res = await fetch(`${API}/api/translate/image`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form });
        const data = await res.json();
        setScanning(false);
        if (data.translations?.length > 0) {
          const first = data.translations[0];
          setTranslation({ src: first.original, tgt: first.translated, lang: first.detectedLang });
          showToast(`✅ Found ${data.translations.length} text element(s)`);
        } else { showToast("⚠️ No text detected — try a clearer angle"); }
      }, "image/jpeg", 0.92);
    } catch { setScanning(false); showToast("❌ Failed to process image"); }
  };

  const tapSign = async (sign) => {
    setHighlighted(sign.text);
    setTimeout(() => setHighlighted(null), 1400);
    const result = await translate({ text: sign.text, sourceLang: "auto", targetLang: tgtL });
    setTranslation({ src: sign.text, tgt: result || sign.trans, lang: sign.from });
  };

  return (
    <div className="cam-page">
      <div className="page-hero">
        <div className="inner">
          <span className="sec-tag tag-blue">📸 Camera Translator</span>
          <h1>Point, Tap,<br /><span className="grad-text">Translated.</span></h1>
          <p>Instantly translate signs, menus, labels, and text in the real world. No typing needed — just point your camera.</p>
        </div>
      </div>

      <div className="cam-body">
        <div className="inner" style={{ maxWidth: 860 }}>
          <div className="cam-layout">
            {/* Camera / Demo panel */}
            <div className="cam-main">
              <div className="cam-toolbar">
                <select className="inp" value={tgtL} onChange={e => setTgtL(e.target.value)} style={{ flex: 1, maxWidth: 200 }}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} Translate to {l.label}</option>)}
                </select>
                <div className="zoom-btns">
                  {[1,2,3].map(z => <button key={z} className={`zoom-btn ${zoom === z ? "on" : ""}`} onClick={() => setZoom(z)}>{z}×</button>)}
                </div>
                {cameraActive ? (
                  <button className="btn-outline" onClick={stopCamera} style={{ fontSize: 13 }}>⏹ Stop</button>
                ) : (
                  <button className="btn-primary" onClick={startCamera} style={{ fontSize: 13 }}>📷 Use Camera</button>
                )}
              </div>

              <div className="cam-viewport" style={{ zoom: zoom > 1 ? 1 : 1 }}>
                {cameraActive ? (
                  <>
                    <video ref={videoRef} className="cam-video" playsInline muted />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <div className="cam-overlay">
                      <div className="scan-frame-live">
                        <span className="sc tl"/><span className="sc tr"/><span className="sc bl"/><span className="sc br"/>
                        <div className="scan-line" />
                      </div>
                    </div>
                    <button className={`capture-btn ${scanning ? "scanning" : ""}`} onClick={captureAndTranslate} disabled={scanning}>
                      {scanning ? "⏳" : "⚡ Scan & Translate"}
                    </button>
                    {cameraError && <div className="cam-err">{cameraError}</div>}
                  </>
                ) : (
                  /* DEMO MODE */
                  <div className="demo-viewport">
                    <div className="demo-bg" />
                    {DEMO_SIGNS.map((s, i) => (
                      <div
                        key={i}
                        className={`sign-pill ${highlighted === s.text ? "highlighted" : ""}`}
                        style={s.style}
                        onClick={() => tapSign(s)}
                      >
                        {s.text}
                      </div>
                    ))}
                    <div className="scan-frame-demo">
                      <span className="sc tl"/><span className="sc tr"/><span className="sc bl"/><span className="sc br"/>
                      <div className="scan-line" />
                    </div>
                    {!cameraError && (
                      <div className="demo-hint">👆 Tap any sign to translate</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Result panel */}
            <div className="cam-result-panel">
              <div className="crp-label">Translation Result</div>
              {translation.src ? (
                <div className="crp-content">
                  <div className="crp-src">
                    <div className="crp-meta">Original · {translation.lang || "Auto-detected"}</div>
                    <div className="crp-text">{translation.src}</div>
                  </div>
                  <div className="crp-arrow">↓</div>
                  <div className="crp-tgt">
                    <div className="crp-meta">Translation · {LANGUAGES.find(l => l.code === tgtL)?.label}</div>
                    <div className="crp-text crp-text-accent">{translation.tgt}</div>
                  </div>
                  <div className="crp-actions">
                    <button className="btn-ghost" onClick={() => speak(translation.tgt, tgtL)}>🔊 Listen</button>
                    <button className="btn-ghost" onClick={() => copyText(translation.tgt, showToast)}>📋 Copy</button>
                    <button className="btn-ghost" onClick={() => showToast("📌 Saved!")}>📌 Save</button>
                  </div>
                </div>
              ) : (
                <div className="crp-empty">
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
                  <div style={{ fontSize: 14, color: "var(--text3)" }}>Tap a sign or scan with camera</div>
                </div>
              )}

              {cameraError && (
                <div className="cam-err-box">
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠️ Camera unavailable</div>
                  <div style={{ fontSize: 13, color: "var(--text3)" }}>{cameraError}</div>
                  <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 8 }}>Use the demo mode above to try camera translation.</div>
                </div>
              )}

              <div className="cam-tips">
                <div className="cam-tip-title">Tips for best results</div>
                <div className="cam-tip">📏 Hold steady, 20–40 cm from text</div>
                <div className="cam-tip">💡 Good lighting improves accuracy</div>
                <div className="cam-tip">🔍 Zoom in on small or complex text</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
