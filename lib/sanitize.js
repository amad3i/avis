// Defense-in-depth sanitization of untrusted input.
// React already escapes output, but we normalize at the boundary so stored
// data stays safe regardless of where it is later rendered (HTML emails,
// CSV export, dangerouslySetInnerHTML, logs, third-party widgets, etc.).

const TEXT_MAX = 2000;

function asStr(v) {
  return typeof v === "string" ? v : "";
}

// Strip control characters (keep \n \r \t) and any angle brackets so that
// no HTML tag can ever be formed from the stored value.
export function sanitizeText(value, maxLen = TEXT_MAX) {
  return asStr(value)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLen);
}

// Tokens are UUID / base64url-ish; allow only safe chars (keep dashes for UUIDs).
export function sanitizeToken(value, maxLen = 64) {
  return asStr(value)
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, maxLen);
}

// Allow only safe URL schemes or relative/anchor links. Blocks
// javascript:, data:, vbscript: and any other non-navigational URI.
export function sanitizeUrl(value, maxLen = 2000) {
  const v = asStr(value).trim();
  if (!v) return "";
  if (/^(https?:\/\/|tel:|mailto:|\/|#)/i.test(v)) return v.slice(0, maxLen);
  return "";
}

// Phone-ish strings that end up inside tel: (e.g. settings.phoneHref).
export function sanitizePhone(value, maxLen = 30) {
  return asStr(value)
    .replace(/[^0-9+()\- ]/g, "")
    .trim()
    .slice(0, maxLen);
}
