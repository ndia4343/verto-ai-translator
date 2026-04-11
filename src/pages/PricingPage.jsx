import { useState } from "react";
import "./PricingPage.css";

const PLANS = [
  {
    id: "free", name: "Free", price: { monthly: 0, annual: 0 }, period: "forever",
    desc: "Perfect for getting started with language translation.",
    features: ["50 text translations/day", "5 languages", "Basic text translator", "Copy & listen output", "Phrasebook (20 phrases)"],
    cta: "Get started free", ctaClass: "btn-outline", stripe: null,
  },
  {
    id: "pro", name: "Pro", price: { monthly: 12, annual: 9 }, period: "/month",
    desc: "For frequent travellers and professionals who need more.",
    features: ["Unlimited text translation", "135 languages", "Voice translator (real-time)", "Camera & OCR translator", "Document translator (20/mo)", "Phrasebook (unlimited)", "Priority AI model", "No ads"],
    cta: "Start Pro →", ctaClass: "btn-grad", stripe: { monthly: "price_pro_monthly", annual: "price_pro_annual" },
    badge: "Most Popular", featured: true,
  },
  {
    id: "business", name: "Business", price: { monthly: 39, annual: 29 }, period: "/seat/month",
    desc: "For teams and organizations that communicate globally.",
    features: ["Everything in Pro", "Team management dashboard", "Unlimited document translation", "API access (1M chars/mo)", "Custom glossary & tone", "SSO & SAML auth", "Priority support", "Custom integrations"],
    cta: "Contact sales →", ctaClass: "btn-outline-bright", stripe: null,
  },
];

const FAQ = [
  { q: "Is the free plan really free?", a: "Yes — no credit card needed. You get 50 translations per day on 5 languages, forever." },
  { q: "Can I cancel my subscription anytime?", a: "Absolutely. Cancel any time from your account dashboard. No questions asked." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards via Stripe. Bank transfers available for Business plans." },
  { q: "Does the annual plan auto-renew?", a: "Yes, annual plans renew automatically. You'll receive an email reminder 7 days before renewal." },
  { q: "What counts as a 'document translation'?", a: "Each file you upload counts as one document translation, regardless of page count." },
  { q: "Is there a student or non-profit discount?", a: "Yes — email us at hello@linguaflow.app with proof of eligibility for 50% off Pro." },
];

export default function PricingPage({ showToast }) {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleCTA = (plan) => {
    if (plan.id === "free") { showToast("🎉 Sign up with the button in the nav!"); return; }
    if (plan.id === "business") { showToast("📧 Email us at hello@linguaflow.app"); return; }
    if (plan.stripe) {
      const key = annual ? plan.stripe.annual : plan.stripe.monthly;
      // In production: redirect to Stripe checkout
      showToast("💳 Redirecting to checkout... (connect Stripe in backend)");
    }
  };

  return (
    <div className="pricing-page">
      <div className="price-hero">
        <div className="inner ctr">
          <span className="sec-tag tag-gold">💳 Pricing</span>
          <h1 className="sec-h" style={{ color: "#f0eaff" }}>Simple, transparent<br /><span className="grad-text">pricing</span></h1>
          <p style={{ color: "rgba(240,234,255,0.65)", marginBottom: 28 }}>No hidden fees. Cancel anytime. Start free.</p>
          <div className="toggle-row">
            <span className={`tog-l ${!annual ? "active" : ""}`}>Monthly</span>
            <button className={`tog-sw ${annual ? "ann" : ""}`} onClick={() => setAnnual(!annual)} aria-label="Toggle billing" />
            <span className={`tog-l ${annual ? "active" : ""}`}>Annual</span>
            <span className="save-badge">Save 25%</span>
          </div>
        </div>
      </div>

      <div className="price-body section">
        <div className="inner">
          <div className="price-grid">
            {PLANS.map(plan => (
              <div key={plan.id} className={`price-card ${plan.featured ? "featured" : ""}`}>
                {plan.badge && <div className="plan-badge">{plan.badge}</div>}
                <div className="pl-name">{plan.name}</div>
                <div className="pl-price-row">
                  <span className="pl-amount">${plan.price[annual ? "annual" : "monthly"]}</span>
                  <span className="pl-period">{plan.period}{annual && plan.price.annual > 0 ? ", billed annually" : ""}</span>
                </div>
                <p className="pl-desc">{plan.desc}</p>
                <ul className="pl-feats">
                  {plan.features.map(f => <li key={f}><span className="check">✓</span>{f}</li>)}
                </ul>
                <button className={`pl-btn ${plan.ctaClass}`} onClick={() => handleCTA(plan)}>{plan.cta}</button>
              </div>
            ))}
          </div>

          {/* Compare table */}
          <div className="compare-section">
            <h3 className="sec-h ctr" style={{ fontSize: "clamp(22px,3vw,34px)", marginBottom: 32 }}>Full comparison</h3>
            <div className="compare-table">
              <div className="ct-header">
                <div>Feature</div><div>Free</div><div className="ct-featured">Pro</div><div>Business</div>
              </div>
              {[
                ["Text translations", "50/day", "Unlimited", "Unlimited"],
                ["Languages", "5", "135", "135"],
                ["Voice translator", "—", "✓", "✓"],
                ["Camera translator", "—", "✓", "✓"],
                ["Document translator", "—", "20/month", "Unlimited"],
                ["Phrasebook", "20 phrases", "Unlimited", "Unlimited"],
                ["API access", "—", "—", "1M chars/mo"],
                ["Priority support", "—", "—", "✓"],
              ].map(([feat, ...vals]) => (
                <div key={feat} className="ct-row">
                  <div className="ct-feat">{feat}</div>
                  {vals.map((v, i) => <div key={i} className={i === 1 ? "ct-featured" : ""}>{v === "✓" ? <span className="ct-check">✓</span> : v === "—" ? <span className="ct-dash">—</span> : v}</div>)}
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <h3 className="sec-h ctr" style={{ fontSize: "clamp(22px,3vw,34px)", marginBottom: 32 }}>Frequently asked</h3>
            <div className="faq-list">
              {FAQ.map((item, i) => (
                <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="faq-q">{item.q} <span className="faq-arrow">{openFaq === i ? "▲" : "▾"}</span></div>
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
