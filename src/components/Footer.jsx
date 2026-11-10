import Logo from "./Logo";
import { IconLock, IconCheckCircle, IconGlobe, IconBolt } from "./Icons";
import "./Footer.css";

export default function Footer({ setPage }) {
  const go = (id) => {
    setPage(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="inner">
        <div className="foot-trust-grid">
          <div className="foot-trust-item">
            <IconLock size={13} />
            <span>256-bit AES</span>
          </div>
          <div className="foot-trust-item">
            <IconCheckCircle size={13} />
            <span>GDPR &amp; HIPAA</span>
          </div>
          <div className="foot-trust-item">
            <IconGlobe size={13} />
            <span>SOC 2 Verified</span>
          </div>
          <div className="foot-trust-item">
            <IconBolt size={13} />
            <span>99.99% SLA</span>
          </div>
        </div>

        <div className="foot-main-row">
          <div className="foot-brand-row">
            <button className="foot-logo-btn" onClick={() => go("home")} aria-label="Verto Home">
              <Logo size={22} />
            </button>
            <div className="foot-copy">
              © 2026 Verto Localization Inc. All rights reserved.
            </div>
          </div>

          <div className="foot-nav-links">
            <button className="foot-link" onClick={() => go("home")}>
              Precision Matrix
            </button>
            <button className="foot-link" onClick={() => go("phrasebook")}>
              TM Bank
            </button>
            <button className="foot-link" onClick={() => go("document-translator")}>
              Document Pipeline
            </button>
            <button className="foot-link" onClick={() => go("text-translator")}>
              Segment Diff
            </button>
            <button className="foot-link" onClick={() => go("pricing")}>
              Enterprise Pricing
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
