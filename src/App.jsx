import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";
import Home from "./pages/Home";
import TextTranslator from "./pages/TextTranslator";
import CameraTranslator from "./pages/CameraTranslator";
import DocumentTranslator from "./pages/DocumentTranslator";
import VoicePage from "./pages/VoicePage";
import Pricing from "./pages/Pricing";
import PhrasebookPage from "./pages/PhrasebookPage";
import Toast from "./components/Toast";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const jumpToTelemetry = () => {
    setPage("home");
    setTimeout(() => {
      document.getElementById("cluster-telemetry")?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };

  const pages = {
    home: Home,
    "text-translator": TextTranslator,
    "segment-workbench": TextTranslator,
    "camera-translator": CameraTranslator,
    "document-translator": DocumentTranslator,
    "document-pipeline": DocumentTranslator,
    voice: VoicePage,
    pricing: Pricing,
    phrasebook: PhrasebookPage,
  };

  const PageComponent = pages[page] || Home;

  return (
    <div className="app">
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        setUser={setUser}
        showToast={showToast}
        onJumpTelemetry={jumpToTelemetry}
      />
      <main>
        <PageComponent setPage={setPage} showToast={showToast} user={user} />
      </main>
      <Footer setPage={setPage} />
      <MobileNav page={page} setPage={setPage} onJumpTelemetry={jumpToTelemetry} />
      {toast && <Toast message={toast} />}
    </div>
  );
}
