import { useState } from "react";
import { IconCheck, IconShield } from "../components/Icons";
import "./Pricing.css";

const PLANS = [
  {
    id: "team",
    name: "Team",
    price: { monthly: 49, annual: 39 },
    period: "/seat/mo",
    desc: "For product and documentation teams standardizing multi-locale releases.",
    features: [
      "15+ enterprise target locales",
      "Shared TM Bank glossary (1,000 terms)",
      "Deterministic tone & formality rules",
      "Pixel-preserved PDFs (50 docs/mo)",
      "Real-time Precision Matrix review",
      "XLIFF 2.1, JSON & DOCX export",
    ],
    cta: "Start Team Trial",
    ctaClass: "btn-outline",
  },
  {
    id: "growth",
    name: "Growth",
    price: { monthly: 149, annual: 119 },
    period: "/seat/mo",
    desc: "For global organizations scaling deterministic localization pipelines.",
    features: [
      "50+ enterprise locales & regional variants",
      "Unlimited TM Bank & locked brand tokens",
      "Automated BLEU, COMET & Glossary Gate",
      "Unlimited PDF AST DOM micro-reflow",
      "GitHub, Figma & CI/CD pipeline webhooks",
      "Multi-stage legal & brand approval gates",
      "SAML 2.0 SSO & Okta integration",
    ],
    cta: "Provision Cluster",
    ctaClass: "btn-primary",
    badge: "Recommended",
    featured: true,
    stripe: { monthly: "price_verto_growth_mo", annual: "price_verto_growth_yr" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: "Custom", annual: "Custom" },
    period: "",
    desc: "Isolated cluster infrastructure with strict security and residency SLAs.",
    features: [
      "Everything in Growth",
      "SOC-2 Type II, GDPR & HIPAA compliance",
      "256-bit AES-GCM zero data retention",
      "Pinned EU / US / APAC compute clusters",
      "Isolated tenant terminology memory",
      "Custom API throughput & VPC peering",
      "99.99% uptime SLA & Solutions Architect",
    ],
    cta: "Contact Enterprise Sales",
    ctaClass: "btn-outline",
  },
];

const FAQ = [
  {
    q: "How does Verto guarantee zero layout breakage in PDFs and tables?",
    a: "Verto parses document bounding boxes into an AST DOM before translation. Autonomous micro-reflow balances line widths, table cells, and font metrics across expansion-prone languages like de-DE and ja-JP with 0px overflow drift.",
  },
  {
    q: "How are corporate glossaries enforced deterministically?",
    a: "Locked tokens in your TM Bank (such as AcmeCorp™) are pinned at AST compile time and verified against a 100% Glossary Gate prior to segment approval.",
  },
  {
    q: "What encryption and retention controls govern Verto clusters?",
    a: "All payloads are encrypted in transit and processed in memory with AES-GCM encryption and Zero Data Retention by default. Enterprise workspaces support dedicated regional clusters and cryptographic audit logs.",
  },
  {
    q: "Can Verto integrate with Okta SAML 2.0 and CI/CD pipelines?",
    a: "Yes. Growth and Enterprise workspaces include Okta / SAML 2.0 SSO, granular RBAC for linguists and legal counsel, plus REST & GitHub webhook triggers.",
  },
];

export default function Pricing({ showToast }) {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  const handleCTA = (plan) => {
    if (plan.id === "team") {
      showToast("Use the profile menu in the header to provision your Team cluster");
      return;
    }
    if (plan.id === "enterprise") {
      showToast("Enterprise procurement: enterprise@verto.io");
      return;
    }
    if (plan.stripe) {
      const priceId = annual ? plan.stripe.annual : plan.stripe.monthly;
      showToast(`Initializing checkout session (${priceId})`);
    }
  };

  return (
    <div className="pricing-page">
      <div className="price-hero">
        <div className="inner ctr">
          <span className="sec-tag">ENTERPRISE LICENSING</span>
          <h1 className="sec-h">Predictable pricing for deterministic Localization Ops</h1>
          <p className="price-hero-sub">
            Transparent per-seat licensing with locked TM Bank governance, AST layout reflow, and SOC-2 Type II cluster security.
          </p>
          <div className="toggle-row">
            <span className={`tog-l ${!annual ? "active" : ""}`}>Monthly</span>
            <button
              type="button"
              className={`tog-sw ${annual ? "ann" : ""}`}
              onClick={() => setAnnual(!annual)}
              aria-label="Toggle annual billing"
            />
            <span className={`tog-l ${annual ? "active" : ""}`}>Annual</span>
            <span className="save-badge">Save 20%</span>
          </div>
        </div>
      </div>

      <div className="price-body section">
        <div className="inner">
          <div className="price-grid">
            {PLANS.map((plan) => {
              const val = plan.price[annual ? "annual" : "monthly"];
              const isCustom = typeof val === "string";
              return (
                <div key={plan.id} className={`price-card ${plan.featured ? "featured" : ""}`}>
                  {plan.badge && <div className="plan-badge">{plan.badge}</div>}
                  <div className="pl-name">{plan.name}</div>
                  <div className="pl-price-row">
                    <span className="pl-amount">{isCustom ? val : `$${val}`}</span>
                    {!isCustom && (
                      <span className="pl-period">
                        {plan.period}
                        {annual ? ", billed annually" : ""}
                      </span>
                    )}
                  </div>
                  <p className="pl-desc">{plan.desc}</p>
                  <ul className="pl-feats">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <span className="check">
                          <IconCheck size={13} />
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={`pl-btn ${plan.ctaClass}`}
                    onClick={() => handleCTA(plan)}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparison matrix */}
          <div className="compare-section">
            <h2 className="sec-h ctr compare-heading">Capability comparison</h2>
            <div className="compare-table">
              <div className="ct-header">
                <div>Capability</div>
                <div>Team</div>
                <div className="ct-featured-hd">Growth</div>
                <div>Enterprise</div>
              </div>
              {[
                ["Target locales", "15+", "50+", "50+ Custom"],
                ["TM Bank terminology", "1,000 terms", "Unlimited", "Unlimited"],
                ["DOM layout micro-reflow", "50 docs / mo", "Unlimited", "Unlimited"],
                ["Automated quality gate", "Glossary", "BLEU + COMET", "Custom Thresholds"],
                ["CI/CD & REST API access", "—", "✓", "Dedicated throughput"],
                ["SAML 2.0 SSO & Okta", "—", "✓", "✓"],
                ["Encryption & residency", "AES-GCM", "AES-GCM + ZDR", "Pinned EU / US / APAC"],
              ].map(([feat, ...vals]) => (
                <div key={feat} className="ct-row">
                  <div className="ct-feat">{feat}</div>
                  {vals.map((v, i) => (
                    <div key={i} className={i === 1 ? "ct-featured" : ""}>
                      {v === "✓" ? (
                        <span className="ct-check">
                          <IconCheck size={14} />
                        </span>
                      ) : v === "—" ? (
                        <span className="ct-dash">—</span>
                      ) : (
                        v
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="sec-assurance">
            <div className="sa-icon">
              <IconShield size={18} />
            </div>
            <div className="sa-copy">
              <div className="sa-title">SOC-2 Type II, GDPR &amp; HIPAA Compliant Infrastructure</div>
              <div className="sa-sub">
                Require a signed BAA, DPA, or custom procurement security packet? Contact our engineering desk at enterprise@verto.io.
              </div>
            </div>
          </div>

          <div className="faq-section">
            <h2 className="sec-h ctr compare-heading">Procurement &amp; Security FAQ</h2>
            <div className="faq-list">
              {FAQ.map((item, i) => (
                <div
                  key={item.q}
                  className={`faq-item ${openFaq === i ? "open" : ""}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="faq-q">
                    <span>{item.q}</span>
                    <span className="faq-arrow">{openFaq === i ? "▴" : "▾"}</span>
                  </div>
                  {openFaq === i && <div className="faq-a fade-in">{item.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
