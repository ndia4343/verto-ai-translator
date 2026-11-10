import { useState, useRef, useEffect } from "react";
import Logo from "./Logo";
import { IconBolt, IconUser, IconFile, IconFrame, IconMatrix } from "./Icons";
import { TRANSLATE_API_BASE_URL as API } from "../hooks/useTranslate";
import "./Navbar.css";

export default function Navbar({ page, setPage, user, setUser, showToast, onJumpTelemetry }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const loginRef = useRef(null);
  const pipelineRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("verto_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginOpen(false);
      if (pipelineRef.current && !pipelineRef.current.contains(e.target)) setPipelineOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const nav = (p) => {
    setPage(p);
    setMobileOpen(false);
    setPipelineOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTelemetryClick = () => {
    setMobileOpen(false);
    setPipelineOpen(false);
    if (onJumpTelemetry) {
      onJumpTelemetry();
    } else {
      setPage("home");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
      const body = isSignup
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("verto_user", JSON.stringify(data.user));
        localStorage.setItem("verto_token", data.token);
        setLoginOpen(false);
        showToast(isSignup ? "Verto workspace provisioned" : "Signed in to Verto");
      } else {
        showToast(data.message || "Authentication failed");
      }
    } catch {
      showToast("API gateway offline — check VITE_TRANSLATE_API_URL");
    }
    setLoading(false);
  };

  const handleOAuth = (provider) => {
    window.location.href = `${API}/api/auth/${provider.toLowerCase().replace(/\s+/g, "-")}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("verto_user");
    localStorage.removeItem("verto_token");
    setLoginOpen(false);
    showToast("Signed out of Verto workspace");
  };

  const pipelines = [
    {
      id: "document-translator",
      icon: <IconFile size={15} />,
      label: "Document Pipeline",
      sub: "Pixel-preserved PDF & AST reflow",
    },
    {
      id: "text-translator",
      icon: <IconMatrix size={15} />,
      label: "Segment Diff Workbench",
      sub: "Glossary-enforced string review",
    },
    {
      id: "camera-translator",
      icon: <IconFrame size={15} />,
      label: "Visual Asset OCR",
      sub: "UI & packaging text extraction",
    },
  ];

  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="nav-logo" onClick={() => nav("home")} aria-label="Verto Home">
          <Logo size={26} />
        </button>

        <nav className="nav-links" aria-label="Primary">
          <button className={`nt ${page === "home" ? "on" : ""}`} onClick={() => nav("home")}>
            Matrix
          </button>

          <button className={`nt ${page === "phrasebook" ? "on" : ""}`} onClick={() => nav("phrasebook")}>
            TM Bank
          </button>

          <div className="dd-wrap" ref={pipelineRef}>
            <button
              className={`nt ${
                ["text-translator", "camera-translator", "document-translator", "voice"].includes(page)
                  ? "on"
                  : ""
              }`}
              onClick={() => setPipelineOpen(!pipelineOpen)}
            >
              Pipelines <span className="chevron">{pipelineOpen ? "▴" : "▾"}</span>
            </button>
            {pipelineOpen && (
              <div className="dd-panel">
                {pipelines.map((w) => (
                  <button key={w.id} className="dd-item" onClick={() => nav(w.id)}>
                    <div className="dd-ic">{w.icon}</div>
                    <div className="dd-copy">
                      <div className="dd-label">{w.label}</div>
                      <div className="dd-sub">{w.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="nt" onClick={handleTelemetryClick}>
            Telemetry
          </button>
          <button className={`nt ${page === "pricing" ? "on" : ""}`} onClick={() => nav("pricing")}>
            Pricing
          </button>
        </nav>

        <div className="nav-right">
          <button
            className="deploy-pill-btn"
            onClick={() => {
              nav("document-translator");
              showToast("Deployment pipeline opened");
            }}
          >
            <IconBolt size={13} />
            <span>Deploy</span>
          </button>

          <button
            className="hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="login-dd" ref={loginRef}>
            {user ? (
              <button
                className="avatar-btn active"
                onClick={() => setLoginOpen(!loginOpen)}
                aria-label="Workspace account"
              >
                <span className="avatar-initial">{user.name?.[0]?.toUpperCase() || "V"}</span>
              </button>
            ) : (
              <button
                className="avatar-btn"
                onClick={() => setLoginOpen(!loginOpen)}
                aria-label="Sign in to workspace"
              >
                <IconUser size={15} />
              </button>
            )}

            {loginOpen && user && (
              <div className="user-panel">
                <div className="up-info">
                  <div className="up-avatar">{user.name?.[0]?.toUpperCase() || "V"}</div>
                  <div>
                    <div className="up-name">{user.name}</div>
                    <div className="up-email">{user.email}</div>
                  </div>
                </div>
                <div className="divider" />
                <button className="up-item" onClick={() => nav("pricing")}>
                  Enterprise Licensing
                </button>
                <button className="up-item" onClick={() => nav("phrasebook")}>
                  TM Bank &amp; Glossary
                </button>
                <div className="divider" />
                <button className="up-item danger" onClick={logout}>
                  Sign out
                </button>
              </div>
            )}

            {loginOpen && !user && (
              <div className="login-panel">
                <div className="lp-title">
                  {isSignup ? "Provision Verto cluster" : "Sign in to Verto"}
                </div>
                <div className="lp-sub">
                  {isSignup
                    ? "Deploy an isolated glossary & AST localization workspace"
                    : "Access your cryptographically auditable workspace"}
                </div>
                <div className="oauth-group">
                  {["Okta SAML 2.0", "Google Workspace", "Microsoft Entra"].map((p) => (
                    <button key={p} type="button" className="oauth-btn" onClick={() => handleOAuth(p)}>
                      <span className="oauth-dot" />
                      Continue with {p}
                    </button>
                  ))}
                </div>
                <div className="lp-divider">
                  <span>or work email</span>
                </div>
                <form onSubmit={handleAuth}>
                  {isSignup && (
                    <input
                      className="inp"
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  )}
                  <input
                    className="inp"
                    type="email"
                    placeholder="name@enterprise.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                  <input
                    className="inp"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button className="lp-submit" type="submit" disabled={loading}>
                    {loading ? "Authenticating..." : isSignup ? "Provision Cluster" : "Sign in"}
                  </button>
                </form>
                <div className="lp-switch">
                  {isSignup ? "Already provisioned? " : "New organization? "}
                  <span onClick={() => setIsSignup(!isSignup)}>
                    {isSignup ? "Sign in" : "Create workspace"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          {[
            { id: "home", label: "Precision Matrix" },
            { id: "phrasebook", label: "TM Bank & Glossary" },
            { id: "document-translator", label: "Document Pipeline" },
            { id: "text-translator", label: "Segment Diff Workbench" },
            { id: "camera-translator", label: "Visual Asset OCR" },
            { id: "voice", label: "Media & Audio Ops" },
            { id: "pricing", label: "Enterprise Pricing" },
          ].map((p) => (
            <button key={p.id} className={`mob-link ${page === p.id ? "on" : ""}`} onClick={() => nav(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
