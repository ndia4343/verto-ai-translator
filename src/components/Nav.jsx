import { useState, useRef, useEffect } from "react";
import "./Nav.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Nav({ page, setPage, theme, setTheme, user, setUser, showToast }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const loginRef = useRef(null);
  const productRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("lf_user");
    if (saved) { try { setUser(JSON.parse(saved)); } catch(e) {} }
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginOpen(false);
      if (productRef.current && !productRef.current.contains(e.target)) setProductOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const nav = (p) => { setPage(p); setMobileOpen(false); setProductOpen(false); };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
      const body = isSignup ? { name: form.name, email: form.email, password: form.password } : { email: form.email, password: form.password };
      const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("lf_user", JSON.stringify(data.user));
        localStorage.setItem("lf_token", data.token);
        setLoginOpen(false);
        showToast(isSignup ? "🎉 Account created!" : "👋 Welcome back!");
      } else { showToast("❌ " + (data.message || "Auth failed")); }
    } catch { showToast("❌ Network error — check connection"); }
    setLoading(false);
  };

  const handleOAuth = (provider) => {
    window.location.href = `${API}/api/auth/${provider.toLowerCase()}`;
  };

  const logout = () => { setUser(null); localStorage.removeItem("lf_user"); localStorage.removeItem("lf_token"); showToast("👋 Signed out"); };

  const products = [
    { id: "text-translator", icon: "📝", label: "Text Translator", sub: "Instant AI translation" },
    { id: "camera-translator", icon: "📸", label: "Camera Translator", sub: "Point & translate live" },
    { id: "document-translator", icon: "📄", label: "Document Translator", sub: "Upload PDFs & docs" },
  ];

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => nav("home")}>
        <div className="nav-mark">LF</div>
        <span className="nav-name">LinguaFlow</span>
      </div>

      <div className="nav-links">
        <button className={`nt ${page === "home" ? "on" : ""}`} onClick={() => nav("home")}>Home</button>
        <div className="dd-wrap" ref={productRef}>
          <button className={`nt ${["text-translator","camera-translator","document-translator"].includes(page) ? "on" : ""}`} onClick={() => setProductOpen(!productOpen)}>
            Products <span className="chevron">{productOpen ? "▲" : "▾"}</span>
          </button>
          {productOpen && (
            <div className="dd-panel">
              {products.map(p => (
                <div key={p.id} className="dd-item" onClick={() => nav(p.id)}>
                  <div className="dd-ic">{p.icon}</div>
                  <div><div className="dd-label">{p.label}</div><div className="dd-sub">{p.sub}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className={`nt ${page === "voice" ? "on" : ""}`} onClick={() => nav("voice")}>Voice</button>
        <button className={`nt ${page === "phrasebook" ? "on" : ""}`} onClick={() => nav("phrasebook")}>Phrasebook</button>
        <button className={`nt ${page === "pricing" ? "on" : ""}`} onClick={() => nav("pricing")}>Pricing</button>
      </div>

      <div className="nav-right">
        <button className="theme-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div className="user-menu" ref={loginRef}>
            <button className="user-avatar" onClick={() => setLoginOpen(!loginOpen)}>
              <div className="avatar-circle">{user.name?.[0]?.toUpperCase() || "U"}</div>
              <span className="user-name-short">{user.name?.split(" ")[0]}</span>
              <span className="chevron">▾</span>
            </button>
            {loginOpen && (
              <div className="user-panel">
                <div className="up-info">
                  <div className="up-avatar">{user.name?.[0]?.toUpperCase() || "U"}</div>
                  <div><div className="up-name">{user.name}</div><div className="up-email">{user.email}</div></div>
                </div>
                <div className="divider" />
                <div className="up-item" onClick={() => { nav("pricing"); setLoginOpen(false); }}>⭐ Upgrade plan</div>
                <div className="up-item" onClick={() => { nav("phrasebook"); setLoginOpen(false); }}>📌 My Phrasebook</div>
                <div className="divider" />
                <div className="up-item danger" onClick={logout}>Sign out</div>
              </div>
            )}
          </div>
        ) : (
          <div className="login-dd" ref={loginRef}>
            <button className="login-btn" onClick={() => setLoginOpen(!loginOpen)}>
              🔑 {isSignup ? "Sign up" : "Log in"} <span className="chevron">▾</span>
            </button>
            {loginOpen && (
              <div className="login-panel">
                <div className="lp-title">{isSignup ? "Create account" : "Welcome back"}</div>
                <div className="lp-sub">{isSignup ? "Join 200,000+ global communicators" : "Sign in to your LinguaFlow account"}</div>
                <div className="oauth-group">
                  {["Google","Apple","Microsoft"].map(p => (
                    <button key={p} className="oauth-btn" onClick={() => handleOAuth(p)}>
                      <span className="oauth-icon">{p === "Google" ? "🌐" : p === "Apple" ? "🍎" : "🪟"}</span>
                      Continue with {p}
                    </button>
                  ))}
                </div>
                <div className="lp-divider"><span>or email</span></div>
                <form onSubmit={handleAuth}>
                  {isSignup && <input className="inp" type="text" placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />}
                  <input className="inp" type="email" placeholder="Email address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  <input className="inp" type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                  <button className="lp-submit" type="submit" disabled={loading}>
                    {loading ? "⏳ Loading..." : isSignup ? "Create account →" : "Sign in →"}
                  </button>
                </form>
                <div className="lp-switch">
                  {isSignup ? "Already have an account? " : "Don't have an account? "}
                  <span onClick={() => setIsSignup(!isSignup)}>{isSignup ? "Log in" : "Sign up free"}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          {[{id:"home",label:"Home"},{id:"text-translator",label:"Text Translator"},{id:"camera-translator",label:"Camera"},{id:"document-translator",label:"Documents"},{id:"voice",label:"Voice"},{id:"phrasebook",label:"Phrasebook"},{id:"pricing",label:"Pricing"}].map(p => (
            <button key={p.id} className={`mob-link ${page === p.id ? "on" : ""}`} onClick={() => nav(p.id)}>{p.label}</button>
          ))}
        </div>
      )}
    </nav>
  );
}
