import { useState, useRef, useEffect, useCallback } from "react";

export const TRANSLATE_API_BASE_URL = (
  import.meta.env.VITE_TRANSLATE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "https://aikahan-linguaflow-ai-translator-api.hf.space"
).replace(/\/+$/, "");

const HF_TIMEOUT_MS = 4000;

export function decodeHtmlEntities(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&apos;/g, "'");
}

async function fetchMyMemoryTranslation(text, src, tgt, signal) {
  if (src === tgt) return text;

  if (text.length <= 500) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(src)}|${encodeURIComponent(tgt)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`MyMemory fallback HTTP ${res.status}`);
    }
    const data = await res.json();
    const raw = data?.responseData?.translatedText;
    if (typeof raw !== "string" || !raw.trim()) {
      throw new Error("Invalid response from MyMemory");
    }
    return decodeHtmlEntities(raw);
  }

  const chunks = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
  const translatedChunks = [];
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(src)}|${encodeURIComponent(tgt)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`MyMemory fallback HTTP ${res.status}`);
    }
    const data = await res.json();
    const raw = data?.responseData?.translatedText;
    translatedChunks.push(typeof raw === "string" ? decodeHtmlEntities(raw) : trimmed);
  }
  return translatedChunks.join(" ");
}

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

    const src = (source_lang || sourceLang || "en").split("-")[0].toLowerCase();
    const tgt = (target_lang || targetLang || "").split("-")[0].toLowerCase();
    if (!tgt) {
      setError("Target language is required");
      return null;
    }

    if (src === tgt) {
      setError(null);
      setLoading(false);
      return text;
    }

    abortRef.current?.abort("superseded");
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    // Primary: Hugging Face translation API with 4s timeout
    let hfTranslated = null;
    try {
      const hfController = new AbortController();
      const hfTimer = setTimeout(() => {
        hfController.abort("hf_timeout");
      }, HF_TIMEOUT_MS);

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

      const onParentAbort = () => hfController.abort("parent_abort");
      controller.signal.addEventListener("abort", onParentAbort);

      try {
        let res = await fetch(`${TRANSLATE_API_BASE_URL}/translate`, {
          method: "POST",
          headers,
          body,
          signal: hfController.signal,
        });

        if (res.status === 404) {
          res = await fetch(`${TRANSLATE_API_BASE_URL}/api/translate`, {
            method: "POST",
            headers,
            body,
            signal: hfController.signal,
          });
        }

        if (res.ok) {
          const data = await parseResponseBody(res);
          const candidate =
            data.translation ??
            data.translated_text ??
            data.translatedText ??
            data.result ??
            null;
          if (typeof candidate === "string" && candidate.trim()) {
            hfTranslated = candidate;
            if (reqId === requestIdRef.current) {
              setProvider(data.provider || "huggingface");
              setError(null);
            }
          }
        }
      } finally {
        clearTimeout(hfTimer);
        controller.signal.removeEventListener("abort", onParentAbort);
      }
    } catch {
      // Hugging Face offline, cold-starting, timed out, or blocked by CORS
      hfTranslated = null;
    }

    if (controller.signal.aborted || reqId !== requestIdRef.current) {
      return undefined;
    }

    if (hfTranslated) {
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
      return hfTranslated;
    }

    // Secondary / Fallback: Public CORS-enabled MyMemory REST API
    try {
      const fallbackResult = await fetchMyMemoryTranslation(text, src, tgt, controller.signal);
      if (reqId === requestIdRef.current) {
        setProvider("mymemory");
        setError(null);
        setLoading(false);
      }
      return fallbackResult;
    } catch (fbErr) {
      if (controller.signal.aborted || reqId !== requestIdRef.current) {
        return undefined;
      }
      if (reqId === requestIdRef.current) {
        setError(
          /failed to fetch|networkerror|load failed/i.test(fbErr?.message || "")
            ? "Translation service offline. Please check your network connection."
            : fbErr?.message || "Translation service unavailable"
        );
        setProvider(null);
        setLoading(false);
      }
      return null;
    } finally {
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
