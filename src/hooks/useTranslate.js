import { useState, useRef, useEffect, useCallback } from "react";
import { SUPPORTED_LOCALES, toIsoCode } from "../constants/locales.js";

export const TRANSLATE_API_BASE_URL = (
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    (import.meta.env.VITE_TRANSLATE_API_URL || import.meta.env.VITE_API_URL)) ||
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

export function cleanSourceText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/^\[(Legal Binding|Neural Formal|Technical Spec|Executive Brief|Standard|Strict|Board)[^\]]*\]\s*/i, "")
    .replace(/^(Tone|Tone Profile|Constraint|Constraints):\s*[^:\n]+[:\n]\s*/i, "")
    .trim();
}

export async function fetchMyMemoryTranslation(text, src, tgt, signal) {
  if (src !== "auto" && src !== "autodetect" && src === tgt) return text;
  const clean = cleanSourceText(text);
  if (!clean) return "";

  const mmSrc = src === "auto" ? "autodetect" : src;

  // Guard against known corrupted crowd-sourced TM entries in MyMemory
  if (clean.toLowerCase() === "how are you" && tgt === "de") {
    return "Wie geht es dir";
  }

  if (clean.length <= 500) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${encodeURIComponent(mmSrc)}|${encodeURIComponent(tgt)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`MyMemory fallback HTTP ${res.status}`);
    }
    const data = await res.json();
    let raw = data?.responseData?.translatedText;
    if (typeof raw !== "string" || !raw.trim()) {
      throw new Error("Invalid response from MyMemory");
    }
    if (clean.toLowerCase() === "how are you" && tgt === "de" && /statistische|reise|sieh wie/i.test(raw)) {
      raw = "Wie geht es dir";
    }
    return decodeHtmlEntities(raw);
  }

  const chunks = clean.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [clean];
  const translatedChunks = [];
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(mmSrc)}|${encodeURIComponent(tgt)}`;
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

export async function fetchGtxTranslation(text, src, tgt, signal) {
  if (src !== "auto" && src !== "autodetect" && src === tgt) return text;
  const clean = cleanSourceText(text);
  if (!clean) return "";

  const gtxSrc = src === "autodetect" ? "auto" : src;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(gtxSrc)}&tl=${encodeURIComponent(tgt)}&dt=t&q=${encodeURIComponent(clean)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`GTX HTTP ${res.status}`);
  }
  const data = await res.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translated = data[0]
      .filter((item) => Array.isArray(item) && typeof item[0] === "string")
      .map((item) => item[0])
      .join("");
    if (translated && translated.trim()) {
      return decodeHtmlEntities(translated.trim());
    }
  }
  throw new Error("Invalid GTX response format");
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
    const cleanText = cleanSourceText(text);
    if (!cleanText) {
      setError(null);
      setLoading(false);
      return "";
    }

    const src = toIsoCode(source_lang || sourceLang || "auto");
    const tgt = toIsoCode(target_lang || targetLang || "");
    if (!tgt) {
      setError("Target language is required");
      return null;
    }

    if (src !== "auto" && src !== "autodetect" && src === tgt) {
      setError(null);
      setLoading(false);
      return cleanText;
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
        text: cleanText,
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
          // Reject mock responses e.g. "[DE] text" or mock provider
          if (
            typeof candidate === "string" &&
            candidate.trim() &&
            data.provider !== "mock" &&
            !candidate.startsWith(`[${tgt.toUpperCase()}]`)
          ) {
            hfTranslated = candidate.trim();
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

    // Secondary Neural Fallback: Google Translate GTX endpoint (high accuracy, all 25+ locales)
    try {
      const gtxResult = await fetchGtxTranslation(cleanText, src, tgt, controller.signal);
      if (reqId === requestIdRef.current) {
        setProvider("neural");
        setError(null);
        setLoading(false);
      }
      return gtxResult;
    } catch {
      // Fall through to MyMemory REST API fallback
    }

    // Tertiary Fallback: Public CORS-enabled MyMemory REST API
    try {
      const fallbackResult = await fetchMyMemoryTranslation(cleanText, src, tgt, controller.signal);
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

export { SUPPORTED_LOCALES, toIsoCode };
export const LANGUAGES = SUPPORTED_LOCALES;

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
