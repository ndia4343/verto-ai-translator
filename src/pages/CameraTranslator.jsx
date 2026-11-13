import { useState, useRef, useEffect } from "react";
import { useTranslate, LANGUAGES, copyText, TRANSLATE_API_BASE_URL } from "../hooks/useTranslate";
import { IconFrame, IconCopy, IconCheck } from "../components/Icons";
import "./CameraTranslator.css";

const DEMO_ASSETS = [
  {
    id: "UI-01",
    text: "Datenschutz-Einstellungen",
    trans: "Privacy Configuration",
    from: "de-DE",
    style: { top: "24px", left: "20px" },
  },
  {
    id: "UI-02",
    text: "Zugriff verwalten",
    trans: "Manage Tenant Access",
    from: "de-DE",
    style: { top: "76px", right: "22px" },
  },
  {
    id: "UI-03",
    text: "Compliance-Bericht",
    trans: "Compliance Audit Report",
    from: "de-DE",
    style: { top: "136px", left: "34px" },
  },
  {
    id: "UI-04",
    text: "Freigabe erforderlich",
    trans: "Approval Required",
    from: "de-DE",
    style: { bottom: "76px", right: "24px" },
  },
  {
    id: "UI-05",
    text: "AcmeCorp™ Enterprise",
    trans: "AcmeCorp™ Enterprise (Locked)",
    from: "de-DE",
    style: { bottom: "64px", left: "24px" },
  },
];

export default function CameraTranslator({ showToast }) {
  const { translate, loading } = useTranslate();
  const [tgtL, setTgtL] = useState("en");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [translation, setTranslation] = useState({ src: "", tgt: "", lang: "", id: "" });
  const [zoom, setZoom] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setCameraError(null);
    } catch (e) {
      setCameraError(
        e.name === "NotAllowedError"
          ? "Camera permission denied."
          : e.name === "NotFoundError"
          ? "No optical capture device detected."
          : e.message
      );
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const captureAndTranslate = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setScanning(true);
    const token = localStorage.getItem("verto_token");

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setScanning(false);
          showToast("Optical capture frame empty");
          return;
        }
        try {
          const form = new FormData();
          form.append("image", blob, "capture.jpg");
          form.append("targetLang", tgtL);
          const res = await fetch(`${TRANSLATE_API_BASE_URL}/api/translate/image`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
          });
          const data = await res.json().catch(() => ({}));
          setScanning(false);
          if (res.ok && data.translations?.length > 0) {
            const first = data.translations[0];
            setTranslation({
              id: "OCR-01",
              src: first.original,
              tgt: first.translated,
              lang: first.detectedLang,
            });
            showToast(`Extracted ${data.translations.length} visual bounding region(s)`);
          } else {
            showToast(data.message || "No readable text regions detected");
          }
        } catch {
          setScanning(false);
          showToast("Optical extraction endpoint unavailable");
        }
      },
      "image/jpeg",
      0.92
    );
  };

  const inspectAssetNode = async (node) => {
    setHighlighted(node.text);
    setTimeout(() => setHighlighted(null), 1400);
    const result = await translate({ text: node.text, sourceLang: "auto", targetLang: tgtL });
    if (result === undefined) return;
    setTranslation({
      id: node.id,
      src: node.text,
      tgt: result || node.trans,
      lang: node.from,
    });
  };

  return (
    <div className="cam-page">
      <div className="page-hero">
        <div className="inner">
          <span className="sec-tag">LIVE OCR &amp; AST ENGINE</span>
          <h1>Visual &amp; Surface OCR Extraction</h1>
          <p>
            Extract copy from UI mockups, hardware labels, and printed collateral while preserving bounding boxes and locked brand terminology.
          </p>
        </div>
      </div>

      <div className="cam-body">
        <div className="inner" style={{ maxWidth: 940 }}>
          <div className="cam-layout">
            <div className="cam-main">
              <div className="cam-toolbar">
                <select
                  className="inp"
                  value={tgtL}
                  onChange={(e) => setTgtL(e.target.value)}
                  style={{ flex: 1, maxWidth: 230 }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      Target: {l.locale}
                    </option>
                  ))}
                </select>
                <div className="zoom-btns">
                  {[1, 2, 3].map((z) => (
                    <button
                      key={z}
                      className={`zoom-btn ${zoom === z ? "on" : ""}`}
                      onClick={() => setZoom(z)}
                    >
                      {z}×
                    </button>
                  ))}
                </div>
                {cameraActive ? (
                  <button className="btn-outline" onClick={stopCamera}>
                    Stop Capture
                  </button>
                ) : (
                  <button className="btn-primary" onClick={startCamera}>
                    Enable Optical Capture
                  </button>
                )}
              </div>

              <div className="cam-viewport">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} className="cam-video" playsInline muted />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <div className="cam-overlay">
                      <div className="scan-frame-live">
                        <span className="sc tl" />
                        <span className="sc tr" />
                        <span className="sc bl" />
                        <span className="sc br" />
                        <div className="scan-line" />
                      </div>
                    </div>
                    <button
                      className={`capture-btn ${scanning ? "scanning" : ""}`}
                      onClick={captureAndTranslate}
                      disabled={scanning}
                    >
                      {scanning ? "Extracting AST..." : "Capture & Extract Strings"}
                    </button>
                    {cameraError && <div className="cam-err">{cameraError}</div>}
                  </>
                ) : (
                  <div className="demo-viewport">
                    <div className="demo-bg" />
                    {DEMO_ASSETS.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        className={`sign-pill ${highlighted === s.text ? "highlighted" : ""}`}
                        style={s.style}
                        onClick={() => inspectAssetNode(s)}
                      >
                        <span className="node-id">{s.id}</span>
                        <span>{s.text}</span>
                      </button>
                    ))}
                    <div className="scan-frame-demo">
                      <span className="sc tl" />
                      <span className="sc tr" />
                      <span className="sc bl" />
                      <span className="sc br" />
                      <div className="scan-line" />
                    </div>
                    <div className="demo-hint">Select a bounding node to inspect localized diff</div>
                  </div>
                )}
              </div>
            </div>

            <div className="cam-result-panel">
              <div className="crp-label">SEGMENT INSPECTION</div>
              {translation.src ? (
                <div className="crp-content">
                  <div className="crp-src">
                    <div className="crp-meta">
                      {translation.id} · SOURCE [{translation.lang}]
                    </div>
                    <div className="crp-text">{translation.src}</div>
                  </div>
                  <div className="crp-tgt">
                    <div className="crp-meta-row">
                      <span className="crp-meta-accent">
                        LOCALIZED [{LANGUAGES.find((l) => l.code === tgtL)?.locale}]
                      </span>
                      <span className="glossary-mini">
                        <IconCheck size={10} />
                        <span>{loading ? "Compiling..." : "Glossary: 100%"}</span>
                      </span>
                    </div>
                    <div className="crp-text">{loading ? "Compiling..." : translation.tgt}</div>
                  </div>
                  <div className="crp-actions">
                    <button className="btn-ghost" onClick={() => copyText(translation.tgt, showToast)}>
                      <IconCopy size={13} />
                      <span>Copy</span>
                    </button>
                    <button
                      className="btn-primary"
                      style={{ padding: "7px 12px", fontSize: 12 }}
                      onClick={() => showToast(`${translation.id} approved in visual manifest`)}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ) : (
                <div className="crp-empty">
                  <div className="crp-empty-ico">
                    <IconFrame size={20} />
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(254,250,224,0.6)" }}>
                    Select a detected node or capture an optical frame
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="cam-err-box">
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Capture unavailable</div>
                  <div style={{ fontSize: 12, color: "rgba(254,250,224,0.6)" }}>{cameraError}</div>
                </div>
              )}

              <div className="cam-tips">
                <div className="cam-tip-title">AST CONSTRAINTS</div>
                <div className="cam-tip">Bounding boxes validate 0px overflow drift</div>
                <div className="cam-tip">Trademark tokens remain deterministically locked</div>
                <div className="cam-tip">Supports live optical frames &amp; UI screenshots</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
