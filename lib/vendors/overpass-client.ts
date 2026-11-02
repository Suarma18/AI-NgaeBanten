import { buildOverpassQuery, parseOverpassResponse, type SearchBounds } from "./overpass.ts";
import type { BaliRegionId } from "./regions.ts";

type SearchResult = ReturnType<typeof parseOverpassResponse> & { fetchedAt: string };
const cache = new Map<string, { expires: number; value: SearchResult }>();
let pending: { key: string; promise: Promise<SearchResult> } | null = null;
let lastRequestAt = 0;

export class OsmSearchError extends Error {
  readonly status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export async function searchOpenStreetMap(region: BaliRegionId, bounds?: SearchBounds): Promise<SearchResult> {
  const query = buildOverpassQuery(region, bounds);
  const key = JSON.stringify([region, bounds]);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.value;
  if (pending?.key === key) return pending.promise;
  if (pending || Date.now() - lastRequestAt < 3000) {
    throw new OsmSearchError("Pencarian sedang berlangsung. Tunggu beberapa detik lalu coba lagi.", 429);
  }
  lastRequestAt = Date.now();
  const promise = (async () => {
    const endpoint = process.env.OVERPASS_API_URL || "https://maps.mail.ru/osm/tools/overpass/api/interpreter";
    const url = new URL(endpoint);
    if (url.protocol !== "https:") throw new OsmSearchError("Sumber pencarian belum dikonfigurasi dengan benar.", 503);
    url.searchParams.set("data", query);
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { "User-Agent": "AI-NgaeBanten/0.1 (Bali OSM directory)", Accept: "application/json" },
        signal: AbortSignal.timeout(30000), cache: "no-store"
      });
    } catch {
      throw new OsmSearchError("Sumber OpenStreetMap belum merespons. Data yang sudah dimuat tetap tersedia; coba lagi nanti.", 503);
    }
    if (!response.ok) {
      throw new OsmSearchError(response.status === 429
        ? "Layanan OpenStreetMap sedang membatasi pencarian. Coba lagi nanti."
        : "Pencarian OpenStreetMap sementara tidak tersedia. Coba lagi nanti.", response.status === 429 ? 429 : 503);
    }
    if (Number(response.headers.get("content-length")) > 5_000_000) throw new OsmSearchError("Hasil terlalu besar. Persempit area pencarian.", 502);
    const text = await response.text();
    if (text.length > 5_000_000) throw new OsmSearchError("Hasil terlalu besar. Persempit area pencarian.", 502);
    let result: SearchResult;
    try {
      const fetchedAt = new Date().toISOString();
      result = { ...parseOverpassResponse(JSON.parse(text), region, fetchedAt), fetchedAt };
    } catch {
      throw new OsmSearchError("Hasil OpenStreetMap belum dapat dibaca. Persempit area dan coba lagi.", 502);
    }
    if (cache.size >= 12) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: Date.now() + 600_000, value: result });
    return result;
  })();
  pending = { key, promise };
  try { return await promise; }
  finally { pending = null; }
}
