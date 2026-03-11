const INLINE_THUMBNAIL_FALLBACK_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='%23eaf2ff'/><stop offset='100%' stop-color='%23dbeafe'/></linearGradient></defs><rect width='640' height='360' fill='url(%23g)'/><circle cx='320' cy='160' r='48' fill='%2393c5fd'/><rect x='200' y='240' width='240' height='20' rx='10' fill='%2360a5fa'/><rect x='240' y='274' width='160' height='14' rx='7' fill='%2393c5fd'/></svg>";

export const INLINE_THUMBNAIL_FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(
  INLINE_THUMBNAIL_FALLBACK_SVG
)}`;

const BLOCKED_IMAGE_HOSTS = new Set(["cdn.pressian.com"]);

function normalizeHost(hostname) {
  return String(hostname || "").trim().toLowerCase();
}

export function normalizeImageUrl(rawUrl) {
  let value = String(rawUrl || "").trim();
  if (!value) return "";

  if (value.startsWith("//")) {
    value = `https:${value}`;
  } else if (/^http:\/\//i.test(value)) {
    value = value.replace(/^http:\/\//i, "https://");
  }

  if (/^data:image\//i.test(value)) {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return "";
    const host = normalizeHost(parsed.hostname);
    if (BLOCKED_IMAGE_HOSTS.has(host)) return "";
    return parsed.toString();
  } catch (_) {
    return "";
  }
}

export function resolveThumbnailUrl(rawUrl, fallback = INLINE_THUMBNAIL_FALLBACK) {
  return normalizeImageUrl(rawUrl) || fallback;
}

export function withImageFallback(event, fallback = INLINE_THUMBNAIL_FALLBACK) {
  const target = event?.currentTarget;
  if (!target || target.dataset.fallbackApplied === "1") return;
  target.dataset.fallbackApplied = "1";
  target.src = fallback;
}

