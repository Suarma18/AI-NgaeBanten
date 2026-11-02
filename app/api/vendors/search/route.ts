import { NextResponse } from "next/server";
import { isBaliRegion } from "../../../../lib/vendors/regions.ts";
import { parseSearchBounds } from "../../../../lib/vendors/overpass.ts";
import { OsmSearchError, searchOpenStreetMap } from "../../../../lib/vendors/overpass-client.ts";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const region = params.get("region") || "all";
  const headers = { "Cache-Control": "no-store" };
  if (!isBaliRegion(region)) return NextResponse.json({ error: "Wilayah pencarian harus berada di Bali." }, { status: 400, headers });
  let bounds;
  try { bounds = parseSearchBounds(params.get("bounds")); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Area tidak valid." }, { status: 400, headers }); }
  try {
    const data = await searchOpenStreetMap(region, bounds);
    return NextResponse.json({ ...data, source: "openstreetmap" }, { headers });
  } catch (error) {
    const status = error instanceof RangeError ? 400 : error instanceof OsmSearchError ? error.status : 503;
    return NextResponse.json({ error: error instanceof RangeError || error instanceof OsmSearchError ? error.message : "Pencarian sementara tidak tersedia." }, {
      status, headers: { ...headers, "Retry-After": status === 429 ? "30" : "15" }
    });
  }
}
