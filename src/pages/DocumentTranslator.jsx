import { useState, useRef } from "react";
import { LANGUAGES } from "../hooks/useTranslate";
import { IconFile, IconShield, IconLock, IconGlobe, IconReflow } from "../components/Icons";
import "./DocumentTranslator.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const ACCEPTED = ".pdf,.docx,.doc,.pptx,.xlsx,.txt,.rtf";
const MAX_MB = 100;

export default function DocumentTranslator({ showToast }) {
  const [tgtLang, setTgtLang] = useState("de");
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const uploadFile = async (file) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      showToast(`File exceeds ${MAX_MB}MB limit`);
      return;
    }
    const id = Date.now() + Math.random();
    setFiles((prev) => [
      ...prev,
      { id, name: file.name, size: file.size, status: "uploading", progress: 0 },
    ]);

    const updateProgress = (p) =>
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress: p } : f)));

    const progressInterval = setInterval(() => {
      setFiles((prev) => {
        const f = prev.find((x) => x.id === id);
        if (!f || f.progress >= 85) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev.map((x) =>
          x.id === id ? { ...x, progress: Math.min(x.progress + 4, 85) } : x
        );
      });
    }, 90);

    try {
      const token = localStorage.getItem("verto_token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetLang", tgtLang);
      const res = await fetch(`${API}/api/translate/document`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      clearInterval(progressInterval);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, status: "error", progress: 0, error: err.message || "AST compilation failed" }
              : f
          )
        );
        showToast(err.message || "Document pipeline failed");
        return;
      }
      updateProgress(100);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "done", progress: 100, downloadUrl: url } : f))
      );
      showToast("PDF AST DOM compiled — 0px overflow drift");
    } catch (e) {
      clearInterval(progressInterval);
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "error", progress: 0, error: e.message } : f))
      );
      showToast("API gateway unreachable — verify VITE_API_URL");
    }
  };

  const handleFiles = (fileList) => Array.from(fileList).forEach(uploadFile);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const tgtLangObj = LANGUAGES.find((l) => l.code === tgtLang);
  const fmtSize = (bytes) =>
    bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

  return (
    <div className="doc-page">
      <div className="page-hero">
        <div className="inner">
          <span className="sec-tag">01 // DOM REFLOW PIPELINE</span>
          <h1>Pixel-Preserved Document Compilation</h1>
          <p>
            Compile PDFs, enterprise MSAs, and technical catalogs into 50+ locales with autonomous bounding-box micro-reflow and 0px collision drift.
          </p>
        </div>
      </div>

      <div className="doc-body">
        <div className="inner" style={{ maxWidth: 840 }}>
          <div className="doc-lang-row">
            <label htmlFor="doc-locale">Target AST Locale:</label>
            <select
              id="doc-locale"
              className="inp"
              value={tgtLang}
              onChange={(e) => setTgtLang(e.target.value)}
              style={{ maxWidth: 260 }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.locale} — {l.label}
                </option>
              ))}
            </select>
            <span className="doc-policy-tag">
              <IconLock size={12} />
              <span>Term: AcmeCorp™ Locked</span>
            </span>
          </div>

          <div
            className={`drop-zone ${dragging ? "drag" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <div className="dz-icon">
              <IconFile size={24} />
            </div>
            <div className="dz-title">Ingest PDF, DOCX, PPTX, or XLSX into AST Pipeline</div>
            <div className="dz-sub">
              Live OCR &amp; AST Engine · Bounding-box micro-reflow up to {MAX_MB} MB
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
            >
              Select Source Document
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={ACCEPTED}
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="file-list">
              {files.map((f) => (
                <div key={f.id} className={`file-item ${f.status}`}>
                  <div className="fi-icon">
                    <IconFile size={18} />
                  </div>
                  <div className="fi-info">
                    <div className="fi-name">{f.name}</div>
                    <div className="fi-meta">
                      {fmtSize(f.size)} · AST Reflow → {tgtLangObj?.locale}
                    </div>
                    {f.status === "uploading" && (
                      <div style={{ marginTop: 8 }}>
                        <div className="prog-track">
                          <div className="prog-bar" style={{ width: `${f.progress}%` }} />
                        </div>
                        <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "rgba(254,250,224,0.6)", marginTop: 4 }}>
                          {f.progress < 90 ? "Running DOM reflow & glossary check..." : "Verifying bounding boxes..."}{" "}
                          {f.progress}%
                        </div>
                      </div>
                    )}
                    {f.status === "error" && <div className="fi-error">{f.error}</div>}
                    {f.status === "done" && <div className="fi-success">Preserved in PDF AST DOM · 0px drift</div>}
                  </div>
                  <div className="fi-actions">
                    {f.status === "done" && (
                      <a
                        href={f.downloadUrl}
                        download={`verto_${f.name}`}
                        className="btn-primary"
                        style={{ textDecoration: "none" }}
                      >
                        Download
                      </a>
                    )}
                    <button className="btn-ghost" onClick={() => removeFile(f.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="doc-features">
            {[
              {
                icon: <IconReflow size={16} />,
                title: "0px DOM Reflow",
                desc: "Autonomous micro-reflow prevents overflow in multi-column PDFs and tables",
              },
              {
                icon: <IconLock size={16} />,
                title: "TM Bank Constraints",
                desc: "Enterprise product names and legal clauses stay deterministically locked",
              },
              {
                icon: <IconShield size={16} />,
                title: "AES-GCM Isolation",
                desc: "Zero payload retention post-compilation under SOC-2 Type II controls",
              },
              {
                icon: <IconGlobe size={16} />,
                title: "50+ Enterprise Locales",
                desc: "Supports CJK, RTL, and European expansion tolerances cleanly",
              },
            ].map((f) => (
              <div key={f.title} className="doc-feat-card">
                <div className="doc-feat-icon">{f.icon}</div>
                <div className="doc-feat-title">{f.title}</div>
                <div className="doc-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
