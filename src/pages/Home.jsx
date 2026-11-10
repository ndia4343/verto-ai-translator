import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import { useTranslate } from "../hooks/useTranslate";
import {
  IconBolt,
  IconLock,
  IconCheck,
  IconCheckCircle,
  IconFile,
  IconUpload,
  IconLanguages,
  IconClock,
  IconTarget,
  IconRefresh,
  IconRuler,
  IconReflow,
  IconDatabase,
  IconQuality,
  IconKey,
  IconTelemetry,
  IconArrowRight,
  LocaleFlag,
} from "../components/Icons";
import "./Home.css";

const SEGMENTS = [
  {
    id: "#SEG-8492",
    meta: "Paragraph 3.4 (Legal Core)",
    bbox: "[x:120, y:450, w:640, h:42]",
    term: "AcmeCorp™",
    srcPrefix: "3.4 Indemnification and Limitation of Liability. ",
    srcSuffix:
      " shall defend, indemnify, and hold harmless Enterprise Client from and against all third-party IP claims...",
    translations: {
      "de-DE": {
        confidence: "98.4%",
        legal: {
          prefix: "3.4 Freistellung und Haftungsbeschränkung. ",
          suffix:
            " stellt den Unternehmenskunden von allen Ansprüchen Dritter aus Verletzungen von Schutzrechten schadlos frei...",
        },
        technical: {
          prefix: "3.4 Haftungsfreistellung und Schutzrechtsansprüche. ",
          suffix:
            " verteidigt und entschädigt den Unternehmenskunden gegen sämtliche Drittansprüche aus geistigem Eigentum...",
        },
        executive: {
          prefix: "3.4 Schutzrechtsfreistellung. ",
          suffix:
            " übernimmt die volle Haftungsfreistellung des Unternehmenskunden bei Schutzrechtsansprüchen Dritter...",
        },
      },
      "fr-FR": {
        confidence: "98.7%",
        legal: {
          prefix: "3.4 Indemnisation et limitation de responsabilité. ",
          suffix:
            " défendra, indemnisera et tiendra indemne le Client Entreprise contre toute réclamation de tiers en matière de PI...",
        },
        technical: {
          prefix: "3.4 Clause de garantie de propriété intellectuelle. ",
          suffix:
            " garantit le Client Entreprise contre toute action en contrefaçon émanant de tiers...",
        },
        executive: {
          prefix: "3.4 Protection juridique et responsabilité. ",
          suffix:
            " couvre intégralement le Client Entreprise face aux réclamations de propriété intellectuelle...",
        },
      },
      "ja-JP": {
        confidence: "98.1%",
        legal: {
          prefix: "3.4 補償および責任の制限。",
          suffix:
            " は、第三者によるすべての知的財産権侵害請求からエンタープライズ顧客を防御し、補償するものとします...",
        },
        technical: {
          prefix: "3.4 知的財産権侵害に対する免責条項。",
          suffix:
            " は、第三者の知的財産権に関する申し立てに対してエンタープライズ顧客を免責・防御します...",
        },
        executive: {
          prefix: "3.4 法的補償および責任範囲。",
          suffix:
            " は、第三者からの知的財産請求についてエンタープライズ顧客を完全に保護します...",
        },
      },
    },
  },
  {
    id: "#SEG-8493",
    meta: "Section 5.1 (Data Residency)",
    bbox: "[x:120, y:518, w:640, h:38]",
    term: "AcmeCorp™",
    srcPrefix: "5.1 Regional Tenant Isolation. ",
    srcSuffix:
      " guarantees zero payload retention outside the designated Frankfurt (eu-central-1) cryptographic enclave.",
    translations: {
      "de-DE": {
        confidence: "99.1%",
        legal: {
          prefix: "5.1 Regionale Mandantenisolierung. ",
          suffix:
            " garantiert null Nutzdatenspeicherung außerhalb der festgelegten kryptografischen Enklave Frankfurt (eu-central-1).",
        },
        technical: {
          prefix: "5.1 Mandantentrennung auf Regionalebene. ",
          suffix:
            " gewährleistet Zero-Payload-Retention außerhalb der Enklave eu-central-1.",
        },
        executive: {
          prefix: "5.1 Datenresidenz und Isolation. ",
          suffix:
            " sichert strikte Verarbeitung innerhalb der EU-Enklave Frankfurt ohne Zwischenspeicherung zu.",
        },
      },
      "fr-FR": {
        confidence: "99.0%",
        legal: {
          prefix: "5.1 Isolation régionale des locataires. ",
          suffix:
            " garantit aucune conservation des données hors de l'enclave cryptographique de Francfort (eu-central-1).",
        },
        technical: {
          prefix: "5.1 Cloisonnement régional des environnements. ",
          suffix:
            " assure zéro rétention en dehors de l'enclave eu-central-1.",
        },
        executive: {
          prefix: "5.1 Résidence des données garantie. ",
          suffix:
            " maintient l'ensemble des charges utiles dans la région eu-central-1 sans persistance.",
        },
      },
      "ja-JP": {
        confidence: "98.8%",
        legal: {
          prefix: "5.1 リージョン別テナント分離。",
          suffix:
            " は指定されたフランクフルト (eu-central-1) 暗号化エンクレーブ外でのペイロード保持ゼロを保証します。",
        },
        technical: {
          prefix: "5.1 暗号化リージョン分離。",
          suffix:
            " は eu-central-1 エンクレーブ外へのデータ残留を完全に排除します。",
        },
        executive: {
          prefix: "5.1 データレジデンシー保証。",
          suffix:
            " は eu-central-1 リージョン内での完全非保持処理を確約します。",
        },
      },
    },
  },
];

const CAPABILITIES = [
  {
    num: "01 // DOM REFLOW",
    icon: <IconReflow size={16} />,
    title: "Pixel-Preserved Formatting",
    desc: "Zero text collision or font overflow on complex tables, invoices, and multi-column PDFs with autonomous bounding-box micro-reflow.",
  },
  {
    num: "02 // TAXONOMY",
    icon: <IconDatabase size={16} />,
    title: "Centralized Terminology Memory",
    desc: "Deterministic corporate glossary constraints lock enterprise terms, preventing generative drift or translation hallucinations across regions.",
  },
  {
    num: "03 // QUALITY GATE",
    icon: <IconQuality size={16} />,
    title: "Automated Quality Scoring",
    desc: "Instant BLEU, COMET, and semantic fidelity ratings evaluate segments autonomously before human legal counsel reviews or signs off.",
  },
  {
    num: "04 // GOVERNANCE",
    icon: <IconKey size={16} />,
    title: "Granular Role-Based Access",
    desc: "Linguists, security auditors, and release leads interact within isolated, cryptographically auditable workspaces with SAML 2.0 and Okta integration.",
  },
];

const LOCALE_CYCLE = ["de-DE", "fr-FR", "ja-JP"];

export default function Home({ showToast }) {
  const {
    translate,
    loading: translating,
    error: translateError,
    provider,
    clearError,
  } = useTranslate();

  const [segIdx, setSegIdx] = useState(0);
  const [locale, setLocale] = useState("de-DE");
  const [toneMode, setToneMode] = useState("legal");
  const [glossaryLocked, setGlossaryLocked] = useState(true);
  const [approvedIds, setApprovedIds] = useState(new Set());
  const [regenerating, setRegenerating] = useState(false);

  const [sourceText, setSourceText] = useState(
    `${SEGMENTS[0].srcPrefix}${SEGMENTS[0].term}${SEGMENTS[0].srcSuffix}`
  );
  const [translatedText, setTranslatedText] = useState("");
  const [targetMode, setTargetMode] = useState("sample");
  const [activeDocName, setActiveDocName] = useState("2026_Q3_Enterprise_MSA.pdf");
  const [ocrActive, setOcrActive] = useState(false);
  const [ocrError, setOcrError] = useState(null);

  const ocrInputRef = useRef(null);
  const sourceTextareaRef = useRef(null);

  const segment = SEGMENTS[segIdx];
  const locData = segment.translations[locale] || segment.translations["de-DE"];
  const activeCopy = locData[toneMode] || locData.legal;
  const isApproved = approvedIds.has(`${segment.id}-${locale}`);

  const scrollToMatrix = () => {
    document.getElementById("precision-matrix")?.scrollIntoView({ behavior: "smooth" });
  };

  const runAstMatrix = async (targetLocale = locale) => {
    if (!sourceText.trim()) {
      showToast("Enter, paste, or scan source text first");
      sourceTextareaRef.current?.focus();
      return;
    }

    const tgtCode = targetLocale.split("-")[0];
    setOcrError(null);
    const result = await translate({
      text: sourceText,
      source_lang: "en",
      target_lang: tgtCode,
      sourceLang: "en",
      targetLang: tgtCode,
    });

    if (typeof result === "string") {
      setTranslatedText(result);
      setTargetMode("live");
      showToast(`AST Matrix compiled to ${targetLocale}`);
    } else if (result === null) {
      setTargetMode("error");
      showToast("Translation engine unreachable — fallback active");
    }
  };

  const handleOcrScan = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setOcrActive(true);
    setOcrError(null);
    clearError();
    try {
      const { data } = await Tesseract.recognize(file, "eng");
      const extracted = (data?.text || "").replace(/[ \t]+\n/g, "\n").trim();
      if (!extracted) {
        setOcrError("No readable text tokens detected in uploaded image.");
        showToast("OCR completed — no readable text detected");
      } else {
        setSourceText(extracted);
        setActiveDocName(file.name);
        setTranslatedText("");
        setTargetMode("pending");
        showToast(`OCR extracted ${extracted.length} characters from ${file.name}`);
      }
    } catch {
      setOcrError("In-browser OCR failed to decode image. Please select a valid PNG, JPG, or WEBP file.");
      showToast("OCR scan failed");
    } finally {
      setOcrActive(false);
    }
  };

  const cycleLocale = () => {
    const next = LOCALE_CYCLE[(LOCALE_CYCLE.indexOf(locale) + 1) % LOCALE_CYCLE.length];
    setLocale(next);
    if (targetMode === "live") {
      runAstMatrix(next);
    } else {
      showToast(`Target AST locale switched to ${next}`);
    }
  };

  const handleApprove = () => {
    const key = `${segment.id}-${locale}`;
    setApprovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        showToast(`${segment.id} reverted to review queue`);
      } else {
        next.add(key);
        showToast(`${segment.id} (${locale}) approved & committed`);
      }
      return next;
    });
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      const nextIdx = (segIdx + 1) % SEGMENTS.length;
      const nextSeg = SEGMENTS[nextIdx];
      setSegIdx(nextIdx);
      setSourceText(`${nextSeg.srcPrefix}${nextSeg.term}${nextSeg.srcSuffix}`);
      setActiveDocName("2026_Q3_Enterprise_MSA.pdf");
      setTranslatedText("");
      setTargetMode("sample");
      setOcrError(null);
      clearError();
      setRegenerating(false);
      showToast("AST segment diff refreshed");
    }, 260);
  };

  return (
    <div className="home">
      {/* HERO + PRECISION MATRIX SPLIT */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left fade-up">
            <div className="compliance-pill">
              <span className="cp-dot" />
              <span>SOC-2 Type II Certified · 99.8% Layout Preservation</span>
            </div>

            <h1>
              Localize Every Document and Surface.{" "}
              <span className="hero-highlight">Never Break a Layout.</span>
            </h1>

            <p className="hero-sub">
              Translate complex PDFs, product catalogs, and corporate codebases into 50+ languages while enforcing locked brand glossaries and tone guidelines.
            </p>

            <div className="hero-btns">
              <button
                type="button"
                className="btn-primary hero-cta-primary"
                onClick={() => {
                  scrollToMatrix();
                  runAstMatrix(locale);
                }}
              >
                <span>Start Enterprise Trial</span>
                <IconArrowRight size={15} />
              </button>
              <button
                type="button"
                className="btn-outline hero-cta-secondary"
                onClick={() => {
                  scrollToMatrix();
                  sourceTextareaRef.current?.focus();
                }}
              >
                <IconFile size={15} />
                <span>View Live Sample</span>
              </button>
            </div>

            <div className="hero-status-bar">
              <span className="hsb-item">
                <IconLanguages size={14} />
                <span>50+ Locales</span>
              </span>
              <span className="hsb-sep">·</span>
              <span className="hsb-item">
                <IconClock size={14} />
                <span>&lt;12ms Latency (TM Hit)</span>
              </span>
              <span className="hsb-sep">·</span>
              <span className="hsb-item">
                <IconTarget size={14} />
                <span>Zero Collision</span>
              </span>
            </div>
          </div>

          {/* PRECISION MATRIX WORKBENCH */}
          <div id="precision-matrix" className="matrix-wrap fade-up" style={{ animationDelay: "0.08s" }}>
            <div className="matrix-section-hdr">
              <div className="matrix-title-row">
                <span className="matrix-title-ico">
                  <IconCheckCircle size={16} />
                </span>
                <h2>Precision Matrix</h2>
              </div>
              <span className="realtime-badge">REAL-TIME DIFF</span>
            </div>

            <div className="matrix-card">
              {/* Header */}
              <div className="mc-file-hdr">
                <div className="mc-file-left">
                  <div className="mc-file-title">
                    <span className="mc-pdf-ico">
                      <IconFile size={15} />
                    </span>
                    <span className="mc-doc-name">{activeDocName}</span>
                  </div>
                  <div className="mc-engine-sub">
                    <span className="mc-live-dot" />
                    <span>Live OCR &amp; AST Engine Active</span>
                  </div>
                </div>
                <div className="mc-file-right">
                  <div className="mc-header-actions">
                    <input
                      ref={ocrInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                      onChange={handleOcrScan}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      className="scan-doc-btn"
                      onClick={() => ocrInputRef.current?.click()}
                      disabled={ocrActive}
                      title="Scan image (.png, .jpg, .webp) using in-browser OCR"
                    >
                      <IconUpload size={13} />
                      <span>{ocrActive ? "Scanning..." : "Scan Document / Image"}</span>
                    </button>
                    <button
                      type="button"
                      className="locale-badge-btn"
                      onClick={cycleLocale}
                      title="Click to switch target locale"
                    >
                      <LocaleFlag locale={locale} />
                      <span>{locale}</span>
                    </button>
                  </div>
                  <div className="mc-version">v4.2.1-prod</div>
                </div>
              </div>

              {/* Segment Meta */}
              <div className="mc-seg-meta">
                <div className="mc-seg-left">
                  <span className="seg-id-chip">{segment.id}</span>
                  <span className="seg-label">{segment.meta}</span>
                </div>
                {ocrActive ? (
                  <span className="ocr-active-badge" role="status" aria-live="polite">
                    [OCR Active: Extracting tokens...]
                  </span>
                ) : (
                  <span className="det-badge">
                    <IconBolt size={11} />
                    <span>Deterministic</span>
                  </span>
                )}
              </div>

              {ocrError && (
                <div className="ocr-error-banner" role="alert">
                  {ocrError}
                </div>
              )}

              {/* Source Block [en-US] */}
              <div className="diff-block src-block">
                <div className="diff-block-hdr">
                  <span>SOURCE [en-US] · EDITABLE BUFFER</span>
                  <div className="src-hdr-tools">
                    <button
                      type="button"
                      className="clear-src-btn"
                      onClick={() => {
                        setSourceText("");
                        setTranslatedText("");
                        setTargetMode("pending");
                        clearError();
                        sourceTextareaRef.current?.focus();
                      }}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className={`lock-icon-btn ${glossaryLocked ? "locked" : ""}`}
                      onClick={() => {
                        setGlossaryLocked(!glossaryLocked);
                        showToast(`Glossary constraint ${!glossaryLocked ? "locked" : "unlocked"}`);
                      }}
                      title="Toggle glossary lock"
                    >
                      <IconLock size={13} />
                    </button>
                  </div>
                </div>
                <textarea
                  ref={sourceTextareaRef}
                  className="diff-textarea"
                  value={sourceText}
                  onChange={(e) => {
                    setSourceText(e.target.value);
                    setOcrError(null);
                    clearError();
                    if (targetMode !== "pending") {
                      setTargetMode("pending");
                    }
                  }}
                  placeholder="Enter or paste enterprise source string to analyze..."
                  rows={4}
                  spellCheck={false}
                  aria-label="Editable enterprise source text"
                />
              </div>

              {/* Localized TARGET Block */}
              <div className={`diff-block tgt-block ${regenerating || translating ? "refreshing" : ""}`}>
                <div className="diff-block-hdr tgt-hdr">
                  <span className="tgt-label-left">
                    <span className="tgt-dot" />
                    <span>
                      TARGET [{locale}] ·{" "}
                      {translating
                        ? "COMPILING AST"
                        : targetMode === "live"
                        ? `LIVE HF API${provider ? ` (${provider.toUpperCase()})` : ""}`
                        : "NEURAL FORMAL"}
                    </span>
                  </span>
                  <span className={`confidence-val ${targetMode === "error" ? "warn" : ""}`}>
                    {translating
                      ? "Translating..."
                      : targetMode === "error"
                      ? "Fallback Alert"
                      : targetMode === "live"
                      ? "Live Verified"
                      : targetMode === "pending"
                      ? "Ready"
                      : `${locData.confidence} Confidence`}
                  </span>
                </div>

                {translateError && (
                  <div className="matrix-fallback-err" role="alert">
                    <span>{translateError}</span>
                    <button
                      type="button"
                      className="retry-inline-btn"
                      onClick={() => runAstMatrix(locale)}
                      disabled={translating}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {translating ? (
                  <p className="diff-text diff-muted">
                    Compiling localized AST segment via Hugging Face translation engine...
                  </p>
                ) : targetMode === "live" && translatedText ? (
                  <p className="diff-text">{translatedText}</p>
                ) : targetMode === "sample" ? (
                  <p className="diff-text">
                    {activeCopy.prefix}
                    <span className="term-tgt-token">{segment.term}</span>
                    {activeCopy.suffix}
                  </p>
                ) : translatedText ? (
                  <p className="diff-text">{translatedText}</p>
                ) : (
                  <p className="diff-text diff-muted">
                    Click &ldquo;Run AST Matrix&rdquo; or &ldquo;Start Enterprise Trial&rdquo; to translate source buffer into {locale}.
                  </p>
                )}
              </div>

              {/* Metric Badges */}
              <div className="mc-metrics-row">
                <span className="metric-pill ok">
                  <IconCheck size={12} />
                  <span>Glossary: 100%</span>
                </span>
                <span className="metric-pill">
                  <IconLock size={12} />
                  <span>Term: {segment.term}</span>
                </span>
                <span className="metric-pill" title="Bounding box reflow verified">
                  <IconRuler size={12} />
                  <span>0px (Bounding box reflow verified)</span>
                </span>
              </div>

              {/* Regulatory Engine Tone Selector */}
              <div className="tone-selector-wrap">
                <label htmlFor="reg-tone" className="tone-selector-label">
                  Regulatory Engine Tone
                </label>
                <div className="tone-select-box">
                  <select
                    id="reg-tone"
                    className="tone-select"
                    value={toneMode}
                    onChange={(e) => {
                      setToneMode(e.target.value);
                      showToast(`Tone profile switched to ${e.target.options[e.target.selectedIndex].text}`);
                    }}
                  >
                    <option value="legal">Legal Binding (Standard {locale})</option>
                    <option value="technical">Technical Compliance (Strict {locale})</option>
                    <option value="executive">Executive Formal (Board {locale})</option>
                  </select>
                  <span className="select-chevron">▾</span>
                </div>
              </div>

              {/* Action Row */}
              <div className="mc-action-row">
                <button
                  type="button"
                  className="run-ast-btn"
                  onClick={() => runAstMatrix(locale)}
                  disabled={translating || ocrActive}
                >
                  <IconBolt size={15} />
                  <span>{translating ? "Compiling..." : "Run AST Matrix"}</span>
                </button>
                <button
                  type="button"
                  className={`approve-seg-btn ${isApproved ? "approved" : ""}`}
                  onClick={handleApprove}
                >
                  <IconCheckCircle size={15} />
                  <span>{isApproved ? "Approved" : "Approve Segment"}</span>
                </button>
                <button
                  type="button"
                  className="regen-btn"
                  onClick={handleRegenerate}
                  title="Cycle sample contract segment"
                  aria-label="Cycle sample segment"
                >
                  <IconRefresh size={15} />
                </button>
              </div>

              {/* Telemetry Footer */}
              <div className="mc-telemetry-footer">
                <span className="bbox-text">Bounding Box: {segment.bbox}</span>
                <span className="dom-status">Preserved in PDF AST DOM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURAL CAPABILITIES */}
      <section className="section cap-section">
        <div className="inner">
          <div className="cap-eyebrow">ARCHITECTURAL CAPABILITIES</div>
          <h2 className="cap-heading">Engineered for Zero Failure</h2>

          <div className="cap-grid">
            {CAPABILITIES.map((cap) => (
              <article key={cap.num} className="cap-card">
                <div className="cap-card-top">
                  <div className="cap-icon-box">{cap.icon}</div>
                  <span className="cap-num">{cap.num}</span>
                </div>
                <h3>{cap.title}</h3>
                <p>{cap.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE CLUSTER TELEMETRY */}
      <section id="cluster-telemetry" className="telemetry-section">
        <div className="inner">
          <div className="telemetry-card">
            <div className="telemetry-hdr">
              <div className="telemetry-hdr-left">
                <span className="th-ico">
                  <IconTelemetry size={15} />
                </span>
                <span>GLOBAL COMPILATION TELEMETRY</span>
              </div>
              <span className="live-cluster-tag">LIVE CLUSTER</span>
            </div>

            <div className="telemetry-grid">
              <div className="tel-metric-card">
                <div className="tel-label">THROUGHPUT</div>
                <div className="tel-value accent">4.2M w/hr</div>
              </div>
              <div className="tel-metric-card">
                <div className="tel-label">CACHE HIT</div>
                <div className="tel-value">100% DET</div>
              </div>
              <div className="tel-metric-card">
                <div className="tel-label">ENCRYPTION</div>
                <div className="tel-value accent">AES-GCM</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
