import { useState, useEffect } from "react";
import { useTranslate, LANGUAGES, speak, copyText } from "../hooks/useTranslate";
import "./PhrasebookPage.css";

const CATS = ["All", "Travel", "Business", "Food", "Emergency", "Greetings", "Shopping", "Medical"];
const CAT_COLORS = { Travel:"#00d4ff", Business:"#7b4fff", Food:"#80f0d8", Emergency:"#ff5f6d", Greetings:"#ffe8a0", Shopping:"#a07fff", Medical:"#ff9f43" };

const STARTER_PHRASES = [
  { id:1, en:"Where is the nearest hotel?", tr:"¿Dónde está el hotel más cercano?", flag:"🇪🇸", lang:"Spanish", cat:"Travel" },
  { id:2, en:"I have a reservation.", tr:"J'ai une réservation.", flag:"🇫🇷", lang:"French", cat:"Travel" },
  { id:3, en:"Nice to meet you.", tr:"はじめまして。", flag:"🇯🇵", lang:"Japanese", cat:"Business" },
  { id:4, en:"The bill, please.", tr:"L'addition, s'il vous plaît.", flag:"🇫🇷", lang:"French", cat:"Food" },
  { id:5, en:"I need a doctor.", tr:"Necesito un médico.", flag:"🇪🇸", lang:"Spanish", cat:"Emergency" },
  { id:6, en:"Good morning!", tr:"Guten Morgen!", flag:"🇩🇪", lang:"German", cat:"Greetings" },
  { id:7, en:"How much does this cost?", tr:"Quanto costa questo?", flag:"🇮🇹", lang:"Italian", cat:"Shopping" },
  { id:8, en:"Can I pay by card?", tr:"¿Puedo pagar con tarjeta?", flag:"🇪🇸", lang:"Spanish", cat:"Food" },
  { id:9, en:"Where is the airport?", tr:"ہوائی اڈہ کہاں ہے؟", flag:"🇵🇰", lang:"Urdu", cat:"Travel" },
  { id:10, en:"Please call the police.", tr:"请叫警察。", flag:"🇨🇳", lang:"Chinese", cat:"Emergency" },
  { id:11, en:"I am vegetarian.", tr:"저는 채식주의자입니다.", flag:"🇰🇷", lang:"Korean", cat:"Food" },
  { id:12, en:"Can you send the invoice?", tr:"Können Sie die Rechnung senden?", flag:"🇩🇪", lang:"German", cat:"Business" },
];

export default function PhrasebookPage({ showToast }) {
  const { translate, loading: transLoading } = useTranslate();
  const [phrases, setPhrases] = useState([]);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newPhrase, setNewPhrase] = useState({ en:"", tgtLang:"es" });
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState("grid"); // grid | list

  useEffect(() => {
    const saved = localStorage.getItem("lf_phrases");
    setPhrases(saved ? JSON.parse(saved) : STARTER_PHRASES);
  }, []);

  const save = (next) => { setPhrases(next); localStorage.setItem("lf_phrases", JSON.stringify(next)); };

  const addPhrase = async () => {
    if (!newPhrase.en.trim()) return;
    setAdding(true);
    const tgtLangObj = LANGUAGES.find(l => l.code === newPhrase.tgtLang);
    const tr = await translate({ text: newPhrase.en, sourceLang: "en", targetLang: newPhrase.tgtLang });
    const phrase = {
      id: Date.now(), en: newPhrase.en, tr: tr || "(translation failed)",
      flag: tgtLangObj?.flag || "🌐", lang: tgtLangObj?.label || "", cat: newPhrase.cat || "Travel"
    };
    const next = [phrase, ...phrases];
    save(next);
    setNewPhrase({ en:"", tgtLang:"es" });
    setShowAdd(false); setAdding(false);
    showToast("📌 Phrase saved!");
  };

  const remove = (id) => { save(phrases.filter(p => p.id !== id)); showToast("🗑 Removed"); };

  const filtered = phrases.filter(p =>
    (cat === "All" || p.cat === cat) &&
    (!search || p.en.toLowerCase().includes(search.toLowerCase()) || p.tr.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pb-page">
      <div className="page-hero">
        <div className="inner">
          <span className="sec-tag tag-violet">📌 Phrasebook</span>
          <h1>Your Phrase<br /><span className="grad-text">Collection</span></h1>
          <p>Save, organize, and replay your most-used translations. Your personal language toolkit.</p>
        </div>
      </div>

      <div className="pb-body section">
        <div className="inner">
          {/* Toolbar */}
          <div className="pb-toolbar">
            <input className="inp search-inp" placeholder="🔍 Search phrases..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="view-btns">
              <button className={`btn-ghost ${view==="grid"?"active":""}`} onClick={() => setView("grid")}>⊞ Grid</button>
              <button className={`btn-ghost ${view==="list"?"active":""}`} onClick={() => setView("list")}>☰ List</button>
            </div>
            <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>+ Add Phrase</button>
          </div>

          {/* Add phrase panel */}
          {showAdd && (
            <div className="add-panel fade-in">
              <div className="add-panel-title">Add new phrase</div>
              <div className="add-row">
                <input className="inp" placeholder="Type English phrase..." value={newPhrase.en} onChange={e => setNewPhrase({...newPhrase, en: e.target.value})} onKeyDown={e => e.key==="Enter" && addPhrase()} style={{ flex: 2 }} />
                <select className="inp" value={newPhrase.tgtLang} onChange={e => setNewPhrase({...newPhrase, tgtLang: e.target.value})} style={{ flex: 1 }}>
                  {LANGUAGES.filter(l=>l.code!=="en").map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                </select>
                <select className="inp" value={newPhrase.cat || "Travel"} onChange={e => setNewPhrase({...newPhrase, cat: e.target.value})} style={{ flex: 1 }}>
                  {CATS.filter(c=>c!=="All").map(c => <option key={c}>{c}</option>)}
                </select>
                <button className="btn-primary" onClick={addPhrase} disabled={adding || !newPhrase.en.trim()}>
                  {adding ? "⏳" : "Save"}
                </button>
                <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Cat filters */}
          <div className="cat-filters scroll-x">
            {CATS.map(c => (
              <button key={c} className={`cat-btn ${cat===c?"on":""}`} onClick={() => setCat(c)}>
                {c} {c!=="All" && <span className="cat-count">{phrases.filter(p=>p.cat===c).length}</span>}
              </button>
            ))}
          </div>

          {/* Stats bar */}
          <div className="pb-stats">
            <span>{filtered.length} phrase{filtered.length!==1?"s":""}</span>
            {search && <span> matching "{search}"</span>}
            <button className="btn-ghost" style={{ fontSize:12, marginLeft:"auto" }} onClick={() => { if(window.confirm("Reset to starter phrases?")) { save(STARTER_PHRASES); showToast("✅ Reset!"); } }}>Reset to defaults</button>
          </div>

          {/* Phrases */}
          {filtered.length === 0 ? (
            <div className="pb-empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📌</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>No phrases yet</div>
              <div style={{ color: "var(--text3)", fontSize: 14 }}>Add your first phrase using the button above</div>
            </div>
          ) : (
            <div className={view==="grid" ? "ph-grid" : "ph-list"}>
              {filtered.map(p => (
                <div key={p.id} className={view==="grid" ? "ph-card-full" : "ph-row"}>
                  <div className="phf-top">
                    <span className="phf-flag">{p.flag}</span>
                    <span className="phf-cat" style={{ color: CAT_COLORS[p.cat] || "var(--text3)" }}>{p.cat}</span>
                    <button className="ph-del" onClick={() => remove(p.id)} title="Delete">✕</button>
                  </div>
                  <div className="phf-en">{p.en}</div>
                  <div className="phf-tr">{p.tr}</div>
                  <div className="phf-lang">{p.flag} {p.lang}</div>
                  <div className="phf-actions">
                    <button className="btn-ghost" onClick={() => speak(p.tr)} style={{ fontSize:12 }}>🔊</button>
                    <button className="btn-ghost" onClick={() => copyText(p.tr, showToast)} style={{ fontSize:12 }}>📋</button>
                    <button className="btn-ghost" onClick={() => speak(p.en, "en")} style={{ fontSize:12 }}>🔊 EN</button>
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
