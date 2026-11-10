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
      const token = localStorage.getItem("verto_token");
      const res = await fetch(`${API}/api/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
  { code: "en", locale: "en-US", label: "English (US)" },
  { code: "de", locale: "de-DE", label: "German (DE)" },
  { code: "fr", locale: "fr-FR", label: "French (FR)" },
  { code: "es", locale: "es-ES", label: "Spanish (ES)" },
  { code: "ja", locale: "ja-JP", label: "Japanese (JP)" },
  { code: "it", locale: "it-IT", label: "Italian (IT)" },
  { code: "pt", locale: "pt-BR", label: "Portuguese (BR)" },
  { code: "nl", locale: "nl-NL", label: "Dutch (NL)" },
  { code: "ko", locale: "ko-KR", label: "Korean (KR)" },
  { code: "zh", locale: "zh-CN", label: "Chinese (CN)" },
  { code: "sv", locale: "sv-SE", label: "Swedish (SE)" },
  { code: "pl", locale: "pl-PL", label: "Polish (PL)" },
  { code: "da", locale: "da-DK", label: "Danish (DK)" },
  { code: "fi", locale: "fi-FI", label: "Finnish (FI)" },
  { code: "no", locale: "nb-NO", label: "Norwegian (NO)" },
  { code: "ar", locale: "ar-SA", label: "Arabic (SA)" },
  { code: "tr", locale: "tr-TR", label: "Turkish (TR)" },
  { code: "hi", locale: "hi-IN", label: "Hindi (IN)" },
  { code: "ur", locale: "ur-PK", label: "Urdu (PK)" },
  { code: "ru", locale: "ru-RU", label: "Russian (RU)" },
  { code: "vi", locale: "vi-VN", label: "Vietnamese (VN)" },
  { code: "th", locale: "th-TH", label: "Thai (TH)" },
  { code: "id", locale: "id-ID", label: "Indonesian (ID)" },
  { code: "ms", locale: "ms-MY", label: "Malay (MY)" },
  { code: "fa", locale: "fa-IR", label: "Persian (IR)" },
];

export function speak(text, lang = "en") {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.95;
  window.speechSynthesis.speak(utt);
}

export function copyText(text, showToast) {
  if (!text) return;
  navigator.clipboard
    ?.writeText(text)
    .then(() => showToast?.("Copied to clipboard"))
    .catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast?.("Copied to clipboard");
    });
}
