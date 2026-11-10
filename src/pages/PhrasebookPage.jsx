import { useState, useEffect } from "react";
import { useTranslate, LANGUAGES, copyText } from "../hooks/useTranslate";
import { IconLock, IconCheck, IconCopy, IconDatabase } from "../components/Icons";
import "./PhrasebookPage.css";

const CATS = ["All", "Brand Locked", "Legal Core", "Security", "Product UI", "Billing"];

const STARTER_TERMS = [
  {
    id: 1,
    en: "AcmeCorp™",
    tr: "AcmeCorp™ (Deterministic Lock)",
    locale: "de-DE",
    cat: "Brand Locked",
    locked: true,
  },
  {
    id: 2,
    en: "Indemnification and Limitation of Liability",
    tr: "Freistellung und Haftungsbeschränkung",
    locale: "de-DE",
    cat: "Legal Core",
    locked: true,
  },
  {
    id: 3,
    en: "Zero Data Retention (ZDR)",
    tr: "Keine Datenspeicherung (ZDR)",
    locale: "de-DE",
    cat: "Security",
    locked: true,
  },
  {
    id: 4,
    en: "Single Sign-On (SAML 2.0)",
    tr: "Authentification unique (SAML 2.0)",
    locale: "fr-FR",
    cat: "Security",
    locked: true,
  },
  {
    id: 5,
    en: "Workspace Administrator",
    tr: "ワークスペース管理者",
    locale: "ja-JP",
    cat: "Product UI",
    locked: false,
  },
  {
    id: 6,
    en: "Master Services Agreement",
    tr: "Rahmenvertrag über Dienstleistungen",
    locale: "de-DE",
    cat: "Legal Core",
    locked: false,
  },
  {
    id: 7,
    en: "Net-30 Wire Transfer",
    tr: "Überweisung netto 30 Tage",
    locale: "de-DE",
    cat: "Billing",
    locked: false,
  },
  {
    id: 8,
    en: "Data Processing Addendum",
    tr: "Auftragsverarbeitungsvereinbarung",
    locale: "de-DE",
    cat: "Legal Core",
    locked: true,
  },
];

export default function PhrasebookPage({ showToast }) {
  const { translate } = useTranslate();
  const [terms, setTerms] = useState([]);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newTerm, setNewTerm] = useState({ en: "", tgtLang: "de", cat: "Brand Locked" });
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState("grid");

  useEffect(() => {
    const saved = localStorage.getItem("verto_termbase");
    setTerms(saved ? JSON.parse(saved) : STARTER_TERMS);
  }, []);

  const save = (next) => {
    setTerms(next);
    localStorage.setItem("verto_termbase", JSON.stringify(next));
  };

  const addTerm = async () => {
    if (!newTerm.en.trim()) return;
    setAdding(true);
    const tgtLangObj = LANGUAGES.find((l) => l.code === newTerm.tgtLang);
    const tr = await translate({ text: newTerm.en, sourceLang: "en", targetLang: newTerm.tgtLang });
    const entry = {
      id: Date.now(),
      en: newTerm.en,
      tr: tr || `${newTerm.en} [${tgtLangObj?.locale || "de-DE"}]`,
      locale: tgtLangObj?.locale || "de-DE",
      cat: newTerm.cat || "Brand Locked",
      locked: newTerm.cat === "Brand Locked" || newTerm.cat === "Legal Core",
    };
    const next = [entry, ...terms];
    save(next);
    setNewTerm({ en: "", tgtLang: "de", cat: "Brand Locked" });
    setShowAdd(false);
    setAdding(false);
    showToast("Constraint committed to TM Bank");
  };

  const remove = (id) => {
    save(terms.filter((t) => t.id !== id));
    showToast("Constraint removed from TM Bank");
  };

  const filtered = terms.filter(
    (p) =>
      (cat === "All" || p.cat === cat) &&
      (!search ||
        p.en.toLowerCase().includes(search.toLowerCase()) ||
        p.tr.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pb-page">
      <div className="page-hero">
        <div className="inner">
          <span className="sec-tag">02 // TAXONOMY · TM BANK</span>
          <h1>Centralized Terminology Memory</h1>
          <p>
            Manage deterministic corporate glossary constraints, locked brand trademarks, and approved legal translations across 50+ locales.
          </p>
        </div>
      </div>

      <div className="pb-body section">
        <div className="inner">
          <div className="pb-toolbar">
            <input
              className="inp search-inp"
              placeholder="Query TM Bank terms or localized equivalents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="view-btns">
              <button
                className={`btn-ghost ${view === "grid" ? "active" : ""}`}
                onClick={() => setView("grid")}
              >
                Grid
              </button>
              <button
                className={`btn-ghost ${view === "list" ? "active" : ""}`}
                onClick={() => setView("list")}
              >
                Table
              </button>
            </div>
            <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
              + Add TM Constraint
            </button>
          </div>

          {showAdd && (
            <div className="add-panel fade-in">
              <div className="add-panel-title">COMMIT NEW TERMINOLOGY CONSTRAINT</div>
              <div className="add-row">
                <input
                  className="inp"
                  placeholder="Source term (e.g., AcmeCorp™)"
                  value={newTerm.en}
                  onChange={(e) => setNewTerm({ ...newTerm, en: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addTerm()}
                  style={{ flex: 2 }}
                />
                <select
                  className="inp"
                  value={newTerm.tgtLang}
                  onChange={(e) => setNewTerm({ ...newTerm, tgtLang: e.target.value })}
                  style={{ flex: 1 }}
                >
                  {LANGUAGES.filter((l) => l.code !== "en").map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.locale} — {l.label}
                    </option>
                  ))}
                </select>
                <select
                  className="inp"
                  value={newTerm.cat}
                  onChange={(e) => setNewTerm({ ...newTerm, cat: e.target.value })}
                  style={{ flex: 1 }}
                >
                  {CATS.filter((c) => c !== "All").map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <button
                  className="btn-primary"
                  onClick={addTerm}
                  disabled={adding || !newTerm.en.trim()}
                >
                  {adding ? "Committing..." : "Commit Rule"}
                </button>
                <button className="btn-ghost" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="cat-filters scroll-x">
            {CATS.map((c) => (
              <button
                key={c}
                className={`cat-btn ${cat === c ? "on" : ""}`}
                onClick={() => setCat(c)}
              >
                <span>{c}</span>
                {c !== "All" && (
                  <span className="cat-count">{terms.filter((p) => p.cat === c).length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="pb-stats">
            <span>
              {filtered.length} deterministic rule{filtered.length !== 1 ? "s" : ""} · 100% DET cache hit
            </span>
            {search && <span> matching "{search}"</span>}
            <button
              className="btn-ghost"
              style={{ marginLeft: "auto" }}
              onClick={() => {
                save(STARTER_TERMS);
                showToast("TM Bank defaults restored");
              }}
            >
              Reset defaults
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="pb-empty">
              <div className="pb-empty-ico">
                <IconDatabase size={20} />
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No matching TM Bank entries</div>
              <div style={{ color: "rgba(254,250,224,0.6)", fontSize: 13 }}>
                Add a new term constraint above or clear the active filter.
              </div>
            </div>
          ) : (
            <div className={view === "grid" ? "ph-grid" : "ph-list"}>
              {filtered.map((p) => (
                <div key={p.id} className={view === "grid" ? "ph-card-full" : "ph-row"}>
                  <div className="phf-top">
                    <span className="phf-locale">{p.locale}</span>
                    <span className={`phf-cat ${p.locked ? "locked" : ""}`}>
                      {p.locked && <IconLock size={11} />}
                      <span>{p.cat}</span>
                    </span>
                    <button className="ph-del" onClick={() => remove(p.id)} title="Remove">
                      ×
                    </button>
                  </div>
                  <div className="phf-en">{p.en}</div>
                  <div className="phf-tr">{p.tr}</div>
                  <div className="phf-actions">
                    <span className="phf-match">
                      <IconCheck size={11} />
                      <span>Glossary: 100%</span>
                    </span>
                    <button
                      className="btn-ghost"
                      onClick={() => copyText(p.tr, showToast)}
                      style={{ marginLeft: "auto" }}
                    >
                      <IconCopy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
