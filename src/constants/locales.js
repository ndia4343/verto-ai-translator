export const SUPPORTED_LOCALES = [
  { locale: "en-US", code: "en", label: "en-US (English)", name: "English", flag: "🇺🇸" },
  { locale: "de-DE", code: "de", label: "de-DE (German)", name: "German", flag: "🇩🇪" },
  { locale: "fr-FR", code: "fr", label: "fr-FR (French)", name: "French", flag: "🇫🇷" },
  { locale: "es-ES", code: "es", label: "es-ES (Spanish)", name: "Spanish", flag: "🇪🇸" },
  { locale: "ar-SA", code: "ar", label: "ar-SA (Arabic)", name: "Arabic", flag: "🇸🇦", dir: "rtl" },
  { locale: "ur-PK", code: "ur", label: "ur-PK (Urdu)", name: "Urdu", flag: "🇵🇰", dir: "rtl" },
  { locale: "hi-IN", code: "hi", label: "hi-IN (Hindi)", name: "Hindi", flag: "🇮🇳" },
  { locale: "zh-CN", code: "zh", label: "zh-CN (Chinese)", name: "Chinese", flag: "🇨🇳" },
  { locale: "ja-JP", code: "ja", label: "ja-JP (Japanese)", name: "Japanese", flag: "🇯🇵" },
  { locale: "ko-KR", code: "ko", label: "ko-KR (Korean)", name: "Korean", flag: "🇰🇷" },
  { locale: "it-IT", code: "it", label: "it-IT (Italian)", name: "Italian", flag: "🇮🇹" },
  { locale: "pt-BR", code: "pt", label: "pt-BR (Portuguese)", name: "Portuguese", flag: "🇧🇷" },
  { locale: "nl-NL", code: "nl", label: "nl-NL (Dutch)", name: "Dutch", flag: "🇳🇱" },
  { locale: "tr-TR", code: "tr", label: "tr-TR (Turkish)", name: "Turkish", flag: "🇹🇷" },
  { locale: "ru-RU", code: "ru", label: "ru-RU (Russian)", name: "Russian", flag: "🇷🇺" },
  { locale: "sv-SE", code: "sv", label: "sv-SE (Swedish)", name: "Swedish", flag: "🇸🇪" },
  { locale: "pl-PL", code: "pl", label: "pl-PL (Polish)", name: "Polish", flag: "🇵🇱" },
  { locale: "id-ID", code: "id", label: "id-ID (Indonesian)", name: "Indonesian", flag: "🇮🇩" },
  { locale: "vi-VN", code: "vi", label: "vi-VN (Vietnamese)", name: "Vietnamese", flag: "🇻🇳" },
  { locale: "th-TH", code: "th", label: "th-TH (Thai)", name: "Thai", flag: "🇹🇭" },
  { locale: "da-DK", code: "da", label: "da-DK (Danish)", name: "Danish", flag: "🇩🇰" },
  { locale: "fi-FI", code: "fi", label: "fi-FI (Finnish)", name: "Finnish", flag: "🇫🇮" },
  { locale: "nb-NO", code: "no", label: "nb-NO (Norwegian)", name: "Norwegian", flag: "🇳🇴" },
  { locale: "el-GR", code: "el", label: "el-GR (Greek)", name: "Greek", flag: "🇬🇷" },
  { locale: "cs-CZ", code: "cs", label: "cs-CZ (Czech)", name: "Czech", flag: "🇨🇿" },
  { locale: "uk-UA", code: "uk", label: "uk-UA (Ukrainian)", name: "Ukrainian", flag: "🇺🇦" },
  { locale: "he-IL", code: "he", label: "he-IL (Hebrew)", name: "Hebrew", flag: "🇮🇱", dir: "rtl" },
  { locale: "fa-IR", code: "fa", label: "fa-IR (Persian)", name: "Persian", flag: "🇮🇷", dir: "rtl" },
];

export const SOURCE_LOCALES = [
  { locale: "auto", code: "auto", label: "Auto-Detect Source", flag: "🌐", name: "Auto-Detect" },
  { locale: "en-US", code: "en", label: "en-US (English)", flag: "🇺🇸", name: "English" },
  { locale: "de-DE", code: "de", label: "de-DE (German)", flag: "🇩🇪", name: "German" },
  { locale: "fr-FR", code: "fr", label: "fr-FR (French)", flag: "🇫🇷", name: "French" },
  { locale: "es-ES", code: "es", label: "es-ES (Spanish)", flag: "🇪🇸", name: "Spanish" },
  { locale: "ar-SA", code: "ar", label: "ar-SA (Arabic)", flag: "🇸🇦", name: "Arabic", dir: "rtl" },
  { locale: "ur-PK", code: "ur", label: "ur-PK (Urdu)", flag: "🇵🇰", name: "Urdu", dir: "rtl" },
  { locale: "ru-RU", code: "ru", label: "ru-RU (Russian)", flag: "🇷🇺", name: "Russian" },
  { locale: "zh-CN", code: "zh", label: "zh-CN (Chinese)", flag: "🇨🇳", name: "Chinese" },
  { locale: "ja-JP", code: "ja", label: "ja-JP (Japanese)", flag: "🇯🇵", name: "Japanese" },
  { locale: "hi-IN", code: "hi", label: "hi-IN (Hindi)", flag: "🇮🇳", name: "Hindi" },
  { locale: "ko-KR", code: "ko", label: "ko-KR (Korean)", flag: "🇰🇷", name: "Korean" },
  { locale: "it-IT", code: "it", label: "it-IT (Italian)", flag: "🇮🇹", name: "Italian" },
  { locale: "pt-BR", code: "pt", label: "pt-BR (Portuguese)", flag: "🇧🇷", name: "Portuguese" },
  { locale: "nl-NL", code: "nl", label: "nl-NL (Dutch)", flag: "🇳🇱", name: "Dutch" },
  { locale: "tr-TR", code: "tr", label: "tr-TR (Turkish)", flag: "🇹🇷", name: "Turkish" },
];

export function getLocale(key) {
  if (!key) return SUPPORTED_LOCALES[0];
  const lower = key.toLowerCase();
  if (lower === "auto" || lower === "autodetect") {
    return SOURCE_LOCALES[0];
  }
  return (
    SUPPORTED_LOCALES.find(
      (l) => l.locale.toLowerCase() === lower || l.code.toLowerCase() === lower
    ) ||
    SOURCE_LOCALES.find(
      (l) => l.locale.toLowerCase() === lower || l.code.toLowerCase() === lower
    ) ||
    SUPPORTED_LOCALES[0]
  );
}

export function toIsoCode(localeOrCode) {
  if (!localeOrCode) return "en";
  const trimmed = localeOrCode.trim().toLowerCase();
  if (trimmed === "auto" || trimmed === "autodetect") return "auto";
  return trimmed.split("-")[0];
}
