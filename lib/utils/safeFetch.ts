/**
 * Safely fetches JSON from an API endpoint without throwing SyntaxError
 * when non-JSON / HTML (e.g. <!DOCTYPE html>) or error responses are returned.
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
