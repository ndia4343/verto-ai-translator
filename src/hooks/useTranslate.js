import { useState, useRef, useEffect, useCallback } from "react";

export const TRANSLATE_API_BASE_URL = (
  import.meta.env.VITE_TRANSLATE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "https://aikahan-linguaflow-ai-translator-api.hf.space"
).replace(/\/+$/, "");

const REQUEST_TIMEOUT_MS = 25000;

async function parseResponseBody(res) {
  const raw = await res.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw, isHtml: /<html/i.test(raw) };
  }
}

function formatApiError(res, data) {
  if (
    [502, 503, 504].includes(res.status) ||
    data.isHtml ||
    /pause|sleep|start|build|wake/i.test(data.message || "")
  ) {
    return `Hugging Face Space appears paused or cold-starting (HTTP ${res.status}). Retry in a few seconds.`;
  }
  return data.message || data.error || data.detail || `Translation failed (HTTP ${res.status})`;
}

export function useTranslate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort("unmount");
    };
  }, []);

  const translate = useCallback(async ({ text, sourceLang, source_lang, targetLang, target_lang }) => {
    if (!text?.trim()) {
      setError(null);
      setLoading(false);
      return "";
    }

    const src = (source_lang || sourceLang || "en").split("-")[0];
    const tgt = (target_lang || targetLang || "").split("-")[0];
    if (!tgt) {
      setError("Target language is required");
      return null;
    }

    abortRef.current?.abort("superseded");
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort("timeout");
    }, REQUEST_TIMEOUT_MS);

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("verto_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const body = JSON.stringify({
        text,
        source_lang: src,
        target_lang: tgt,
        sourceLang: src,
        targetLang: tgt,
      });

      let res = await fetch(`${TRANSLATE_API_BASE_URL}/api/translate`, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });

      if (res.status === 404) {
        res = await fetch(`${TRANSLATE_API_BASE_URL}/translate`, {
          method: "POST",
          headers,
          body,
          signal: controller.signal,
        });
      }

      const data = await parseResponseBody(res);
      if (!res.ok) {
        throw new Error(formatApiError(res, data));
      }

      const translated =
        data.translation ??
        data.translated_text ??
        data.translatedText ??
        data.result ??
        null;

      if (typeof translated !== "string") {
        throw new Error("Invalid translation response from API");
      }

      if (reqId === requestIdRef.current) {
        setProvider(data.provider || null);
      }

      return translated;
    } catch (e) {
      if (timedOut) {
        if (reqId === requestIdRef.current) {
          setError("Translation request timed out — Hugging Face Space may be paused or cold-starting. Retry shortly.");
        }
        return null;
      }
      if (e?.name === "AbortError" || reqId !== requestIdRef.current) {
        return undefined;
      }
      setError(
        /failed to fetch|networkerror|load failed/i.test(e?.message || "")
          ? "Unable to reach Hugging Face translation API — the Space may be paused, cold-starting, or offline."
          : e.message || "Translation service unavailable"
      );
      return null;
    } finally {
      clearTimeout(timeoutId);
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const translateDebounced = useCallback(
    (params, delay = 400) => {
      return new Promise((resolve) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
          const result = await translate(params);
          resolve(result);
        }, delay);
      });
    },
    [translate]
  );

  const clearError = useCallback(() => setError(null), []);

  return { translate, translateDebounced, loading, error, provider, clearError };
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
