import { IconMatrix, IconDatabase, IconPipeline, IconTelemetry } from "./Icons";
import "./MobileNav.css";

export default function MobileNav({ page, setPage, onJumpTelemetry }) {
  const go = (target) => {
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile quick navigation">
      <button
        type="button"
        className={`mbn-item ${page === "home" ? "active" : ""}`}
        onClick={() => go("home")}
      >
        <IconMatrix size={16} />
        <span>Matrix</span>
      </button>

      <button
        type="button"
        className={`mbn-item ${page === "phrasebook" ? "active" : ""}`}
        onClick={() => go("phrasebook")}
      >
        <IconDatabase size={16} />
        <span>TM Bank</span>
      </button>

      <button
        type="button"
        className={`mbn-item ${
          ["document-translator", "text-translator", "camera-translator"].includes(page)
            ? "active"
            : ""
        }`}
        onClick={() => go("document-translator")}
      >
        <IconPipeline size={16} />
        <span>Pipelines</span>
      </button>

      <button
        type="button"
        className="mbn-item"
        onClick={() => {
          if (onJumpTelemetry) onJumpTelemetry();
          else go("home");
        }}
      >
        <IconTelemetry size={16} />
        <span>Telemetry</span>
      </button>
    </nav>
  );
}
