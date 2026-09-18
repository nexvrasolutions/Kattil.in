/**
 * Helper to convert any Google Maps URL, place link, coordinates, or address
 * into a valid, embeddable Google Maps iframe URL (with output=embed).
 */
export function getGoogleMapsEmbedUrl(
  urlOrAddress?: string | null,
  fallbackAddress?: string | null
): string {
  const raw = (urlOrAddress || fallbackAddress || "").trim();
  if (!raw) return "";

  // 1. If it's already a working embed URL, return it
  if (raw.includes("output=embed")) {
    return raw;
  }

  // 2. If it's an iframe snippet (e.g. copied from Google Maps embed button: <iframe src="..."/>)
  const iframeSrcMatch = raw.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    return iframeSrcMatch[1];
  }

  // 3. Extract GPS coordinates if present (@lat,lng or q=lat,lng)
  const coordsMatch = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    const lat = coordsMatch[1];
    const lng = coordsMatch[2];
    return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&t=m&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 4. Extract place name from /maps/place/Place+Name/...
  const placeMatch = raw.match(/\/maps\/place\/([^/@?]+)/i);
  if (placeMatch && placeMatch[1]) {
    const decodedPlace = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(decodedPlace)}&t=m&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 5. If it's a URL with a query parameter (?q=...)
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsedUrl = new URL(raw);
      const q = parsedUrl.searchParams.get("q") || parsedUrl.searchParams.get("query");
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=m&z=16&ie=UTF8&iwloc=&output=embed`;
      }
    } catch {
      // Fall through to address encoding
    }
  }

  // 6. Fallback: treat the entire string as a physical search address or query
  const query = raw.startsWith("http") ? (fallbackAddress || "Tamil Nadu, India") : raw;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=m&z=16&ie=UTF8&iwloc=&output=embed`;
}
