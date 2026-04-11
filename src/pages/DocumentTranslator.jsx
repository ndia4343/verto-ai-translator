import { useState, useRef } from "react";
import { LANGUAGES } from "../hooks/useTranslate";
import "./DocumentTranslator.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const ACCEPTED = ".pdf,.docx,.doc,.pptx,.xlsx,.txt,.rtf";
const MAX_MB = 100;

export default function DocumentTranslator({ showToast, user }) {
  const [tgtLang, setTgtLang] = useState("es");
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const uploadFile = async (file) => {
    if (file.size > MAX_MB * 1024 * 1024) { showToast(`❌ File too large (max ${MAX_MB}MB)`); return; }
    const id = Date.now() + Math.random();
    setFiles(prev => [...prev, { id, name: file.name, size: file.size, status: "uploading", progress: 0, result: null }]);

    // Simulate progress then real upload
    const updateProgress = (p) => setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f));
    const progressInterval = setInterval(() => {
      setFiles(prev => {
        const f = prev.find(x => x.id === id);
        if (!f || f.progress >= 85) { clearInterval(progressInterval); return prev; }
        return prev.map(x => x.id === id ? { ...x, progress: Math.min(x.progress + 3, 85) } : x);
      });
    }, 100);

    try {
      const token = localStorage.getItem("lf_token");
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
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "error", progress: 0, error: err.message || "Translation failed" } : f));
        showToast("❌ " + (err.message || "Translation failed"));
        return;
      }
      updateProgress(100);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "done", progress: 100, downloadUrl: url } : f));
      showToast("✅ Translation complete!");
    } catch (e) {
      clearInterval(progressInterval);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "error", progress: 0, error: e.message } : f));
      showToast("❌ Network error");
    }
  };

  const handleFiles = (fileList) => { Array.from(fileList).forEach(uploadFile); };
  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };
  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const tgtLangObj = LANGUAGES.find(l => l.code === tgtLang);

  const fmtSize = (bytes) => bytes > 1024*1024 ? `${(bytes/1024/1024).toFixed(1)}MB` : `${(bytes/1024).toFixed(0)}KB`;

  return (
    <div className="doc-page">
      <div className="page-hero">
        <div className="inner">
          <span className="sec-tag tag-gold">📄 Document Translator</span>
          <h1>Translate Documents<br /><span className="grad-text">Preserving Format</span></h1>
          <p>Upload PDFs, Word docs, PowerPoints, and spreadsheets. Get back a fully translated file with original formatting intact.</p>
        </div>
      </div>

      <div className="doc-body">
        <div className="inner" style={{ maxWidth: 740 }}>
          {/* Target lang */}
          <div className="doc-lang-row">
            <label>Translate to:</label>
            <select className="inp" value={tgtLang} onChange={e => setTgtLang(e.target.value)} style={{ maxWidth: 220 }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>

          {/* Drop zone */}
          <div
            className={`drop-zone ${dragging ? "drag" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <div className="dz-icon">📄</div>
            <div className="dz-title">Drop documents or click to browse</div>
            <div className="dz-sub">PDF, DOCX, PPTX, XLSX, TXT · Up to {MAX_MB}MB per file</div>
            <button className="btn-primary" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>Browse Files</button>
            <input ref={fileRef} type="file" multiple accept={ACCEPTED} style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="file-list">
              {files.map(f => (
                <div key={f.id} className={`file-item ${f.status}`}>
                  <div className="fi-icon">📄</div>
                  <div className="fi-info">
                    <div className="fi-name">{f.name}</div>
                    <div className="fi-meta">
                      {fmtSize(f.size)} · Auto-detected → {tgtLangObj?.flag} {tgtLangObj?.label}
                    </div>
                    {(f.status === "uploading") && (
                      <div style={{ marginTop: 8 }}>
                        <div className="prog-track"><div className="prog-bar" style={{ width: `${f.progress}%` }} /></div>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{f.progress < 90 ? "Translating..." : "Finalizing..."} {f.progress}%</div>
                      </div>
                    )}
                    {f.status === "error" && <div className="fi-error">❌ {f.error}</div>}
                    {f.status === "done" && <div className="fi-success">✅ Translation complete</div>}
                  </div>
                  <div className="fi-actions">
                    {f.status === "done" && (
                      <a href={f.downloadUrl} download={`translated_${f.name}`} className="btn-primary" style={{ fontSize: 13, padding: "7px 14px", textDecoration: "none", display: "inline-block" }}>⬇ Download</a>
                    )}
                    <button className="btn-ghost" onClick={() => removeFile(f.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Features list */}
          <div className="doc-features">
            {[
              { icon: "📐", title: "Format preserved", desc: "Headers, tables, columns, fonts — all maintained" },
              { icon: "⚡", title: "Fast processing", desc: "Most documents translated in under 30 seconds" },
              { icon: "🔒", title: "Secure & private", desc: "Files processed and deleted immediately" },
              { icon: "🌍", title: "135 languages", desc: "Translate between any supported language pair" },
            ].map(f => (
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
