export const SUPPORTED_LOCALES = [
  { locale: "en-US", code: "en", label: "en-US (English)", name: "English" },
  { locale: "de-DE", code: "de", label: "de-DE (German)", name: "German" },
  { locale: "fr-FR", code: "fr", label: "fr-FR (French)", name: "French" },
  { locale: "es-ES", code: "es", label: "es-ES (Spanish)", name: "Spanish" },
  { locale: "ar-SA", code: "ar", label: "ar-SA (Arabic)", name: "Arabic", dir: "rtl" },
  { locale: "ur-PK", code: "ur", label: "ur-PK (Urdu)", name: "Urdu", dir: "rtl" },
  { locale: "hi-IN", code: "hi", label: "hi-IN (Hindi)", name: "Hindi" },
  { locale: "zh-CN", code: "zh", label: "zh-CN (Chinese)", name: "Chinese" },
  { locale: "ja-JP", code: "ja", label: "ja-JP (Japanese)", name: "Japanese" },
  { locale: "ko-KR", code: "ko", label: "ko-KR (Korean)", name: "Korean" },
  { locale: "it-IT", code: "it", label: "it-IT (Italian)", name: "Italian" },
  { locale: "pt-BR", code: "pt", label: "pt-BR (Portuguese)", name: "Portuguese" },
  { locale: "nl-NL", code: "nl", label: "nl-NL (Dutch)", name: "Dutch" },
  { locale: "tr-TR", code: "tr", label: "tr-TR (Turkish)", name: "Turkish" },
  { locale: "ru-RU", code: "ru", label: "ru-RU (Russian)", name: "Russian" },
  { locale: "sv-SE", code: "sv", label: "sv-SE (Swedish)", name: "Swedish" },
  { locale: "pl-PL", code: "pl", label: "pl-PL (Polish)", name: "Polish" },
  { locale: "id-ID", code: "id", label: "id-ID (Indonesian)", name: "Indonesian" },
  { locale: "vi-VN", code: "vi", label: "vi-VN (Vietnamese)", name: "Vietnamese" },
  { locale: "th-TH", code: "th", label: "th-TH (Thai)", name: "Thai" },
  { locale: "da-DK", code: "da", label: "da-DK (Danish)", name: "Danish" },
  { locale: "fi-FI", code: "fi", label: "fi-FI (Finnish)", name: "Finnish" },
  { locale: "nb-NO", code: "no", label: "nb-NO (Norwegian)", name: "Norwegian" },
  { locale: "el-GR", code: "el", label: "el-GR (Greek)", name: "Greek" },
  { locale: "cs-CZ", code: "cs", label: "cs-CZ (Czech)", name: "Czech" },
  { locale: "uk-UA", code: "uk", label: "uk-UA (Ukrainian)", name: "Ukrainian" },
  { locale: "he-IL", code: "he", label: "he-IL (Hebrew)", name: "Hebrew", dir: "rtl" },
  { locale: "fa-IR", code: "fa", label: "fa-IR (Persian)", name: "Persian", dir: "rtl" },
];

export function getLocale(key) {
  if (!key) return SUPPORTED_LOCALES[0];
  const lower = key.toLowerCase();
  return (
    SUPPORTED_LOCALES.find(
      (l) => l.locale.toLowerCase() === lower || l.code.toLowerCase() === lower
    ) || SUPPORTED_LOCALES[0]
  );
}

export function toIsoCode(localeOrCode) {
  if (!localeOrCode) return "en";
  return localeOrCode.trim().split("-")[0].toLowerCase();
}
