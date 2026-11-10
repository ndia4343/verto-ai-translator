# Verto — Enterprise Localization Platform

**Verto** is an enterprise-grade Localization & Translation Ops platform engineered for deterministic terminology enforcement, PDF AST DOM layout preservation, and zero-collision multi-locale workflows.

---

## Core Architecture

- **Precision Matrix (`REAL-TIME DIFF`)** — Live AST diff review with locked corporate glossary tokens (`AcmeCorp™`), bounding-box verification (`0px` overflow drift), and regulatory tone selection.
- **01 // DOM Reflow** — Pixel-preserved formatting across tables, invoices, and multi-column PDFs.
- **02 // Taxonomy (TM Bank)** — Centralized terminology memory preventing generative drift across 50+ locales.
- **03 // Quality Gate** — Automated BLEU, COMET, and semantic fidelity scoring prior to legal sign-off.
- **04 // Governance** — Role-based access control, SAML 2.0 / Okta integration, and AES-GCM cluster telemetry.

---

## Project Structure

```
src/
├── components/
│   ├── Footer.jsx / Footer.css       # Trust badges & Verto footer
│   ├── Icons.jsx                     # Crisp monochrome/chartreuse SVG icons & flags
│   ├── Logo.jsx                      # Geometric interlocking 'V' SVG & wordmark
│   ├── MobileNav.jsx / MobileNav.css # Sticky mobile bottom bar (Matrix, TM Bank, Pipelines, Telemetry)
│   ├── Navbar.jsx / Navbar.css       # Top bar with Deploy CTA, menu, and SSO profile avatar
│   └── Toast.jsx                     # Terminal-style toast feedback
├── hooks/
│   └── useTranslate.js               # Translation API hook & locale catalog
├── pages/
│   ├── Home.jsx / Home.css           # Hero, Precision Matrix, Capabilities & Live Cluster Telemetry
│   ├── Pricing.jsx / Pricing.css     # Team, Growth, and Enterprise licensing
│   ├── TextTranslator.jsx            # Segment Diff Workbench
│   ├── DocumentTranslator.jsx        # AST Document Pipeline
│   ├── CameraTranslator.jsx          # Live OCR & Surface Extraction
│   ├── VoicePage.jsx                 # Briefing & Audio Localization
│   └── PhrasebookPage.jsx            # TM Bank & Terminology Constraints
├── App.jsx
├── main.jsx
└── index.css
```

---

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
