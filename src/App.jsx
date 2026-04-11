import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import TextTranslator from "./pages/TextTranslator";
import CameraTranslator from "./pages/CameraTranslator";
import DocumentTranslator from "./pages/DocumentTranslator";
import VoicePage from "./pages/VoicePage";
import PricingPage from "./pages/PricingPage";
import PhrasebookPage from "./pages/PhrasebookPage";
import Toast from "./components/Toast";
import "./styles/globals.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.body.className = theme === "light" ? "light" : "";
  }, [theme]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const pages = { home: Home, "text-translator": TextTranslator, "camera-translator": CameraTranslator, "document-translator": DocumentTranslator, voice: VoicePage, pricing: PricingPage, phrasebook: PhrasebookPage };
  const PageComponent = pages[page] || Home;

  return (
    <div className={`app ${theme}`}>
      <Nav page={page} setPage={setPage} theme={theme} setTheme={setTheme} user={user} setUser={setUser} showToast={showToast} />
      <main>
        <PageComponent setPage={setPage} showToast={showToast} user={user} />
      </main>
      {toast && <Toast message={toast} />}
    </div>
  );
}
