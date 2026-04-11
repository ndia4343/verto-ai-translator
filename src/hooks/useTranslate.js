import { useState, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useTranslate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const translate = async ({ text, sourceLang, targetLang }) => {
    if (!text?.trim()) return "";
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("lf_token");
      const res = await fetch(`${API}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ text, sourceLang, targetLang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Translation failed");
      return data.translation;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const translateDebounced = (params, delay = 400) => {
    return new Promise((resolve) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const result = await translate(params);
        resolve(result);
      }, delay);
    });
  };

  return { translate, translateDebounced, loading, error };
}

export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "ur", label: "Urdu", flag: "🇵🇰" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" },
  { code: "pl", label: "Polish", flag: "🇵🇱" },
  { code: "nl", label: "Dutch", flag: "🇳🇱" },
  { code: "sv", label: "Swedish", flag: "🇸🇪" },
  { code: "da", label: "Danish", flag: "🇩🇰" },
  { code: "fi", label: "Finnish", flag: "🇫🇮" },
  { code: "no", label: "Norwegian", flag: "🇳🇴" },
  { code: "th", label: "Thai", flag: "🇹🇭" },
  { code: "vi", label: "Vietnamese", flag: "🇻🇳" },
  { code: "id", label: "Indonesian", flag: "🇮🇩" },
  { code: "ms", label: "Malay", flag: "🇲🇾" },
  { code: "fa", label: "Persian", flag: "🇮🇷" },
];

export function speak(text, lang = "en") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

export function copyText(text, showToast) {
  if (!text) return;
  navigator.clipboard?.writeText(text).then(() => showToast?.("📋 Copied!")).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); document.body.removeChild(ta);
    showToast?.("📋 Copied!");
  });
}
