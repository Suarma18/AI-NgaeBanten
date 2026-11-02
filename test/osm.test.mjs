import assert from "node:assert/strict";
import { buildOverpassQuery, parseOverpassResponse, parseSearchBounds, MAX_OSM_RESULTS } from "../lib/vendors/overpass.ts";
import { regionForPoint } from "../lib/vendors/geography.ts";
import { searchOpenStreetMap } from "../lib/vendors/overpass-client.ts";
import { sanitizeVendor } from "../lib/vendors/validation.ts";
import { getBaseVendors } from "../lib/vendors/repository.ts";
import { BALI_REGIONS } from "../lib/vendors/regions.ts";
import snapshotMetadata from "../data/vendors.metadata.json" with { type: "json" };

const node = { type: "node", id: 910001, lat: -8.6582, lon: 115.2131,
  tags: { name: "Fixture Toko Banten Uji", shop: "religion", religion: "hindu", phone: "081234567890" } };
const when = "2026-11-01T12:00:00.000Z";
const raw = { elements: [node] };

assert.equal(regionForPoint(node.lat, node.lon), "Denpasar");
assert.equal(regionForPoint(-8.727, 115.544), "Klungkung");
assert.equal(regionForPoint(-8.219, 114.369), undefined, "Java must not be included by the Bali bounding box");
assert.equal(regionForPoint(NaN, Infinity), undefined);
const snapshot = getBaseVendors();
assert.equal(snapshot.length, snapshotMetadata.count);
assert.equal(new Set(snapshot.map((vendor) => vendor.id)).size, snapshot.length);
for (const region of BALI_REGIONS.filter((entry) => entry.id !== "all")) {
  assert.ok(snapshot.some((vendor) => vendor.regency === region.id), `Missing real snapshot coverage: ${region.id}`);
}
assert.ok(snapshot.every((vendor) => (vendor.source === "openstreetmap" || vendor.source === "curated") && vendor.sourceUrl && !vendor.isSampleFixture));
const parsed = parseOverpassResponse({ elements: [node, node, { ...node, id: 2, lat: -8.219, lon: 114.369 },
  { ...node, id: 3, tags: {} }, { ...node, id: 4, lon: "115.2" }, { ...node, id: "unsafe" }] }, "all", when);
assert.equal(parsed.vendors.length, 1);
assert.equal(parsed.vendors[0].sourceUrl, "https://www.openstreetmap.org/node/910001");
assert.equal(parsed.vendors[0].regency, "Denpasar");
assert.equal(parsed.vendors[0].verificationStatus, "unverified");
assert.deepEqual(parsed.vendors[0].products, []);
assert.equal(parsed.vendors[0].whatsapp, undefined, "A phone number does not establish WhatsApp availability");
assert.match(parsed.vendors[0].address, /belum tercatat/);
assert.equal(parseOverpassResponse(raw, "Gianyar", when).vendors.length, 0);
assert.equal(parseOverpassResponse({ elements: [{ ...node, tags: { name: "Bunga Laundry", shop: "laundry" } }] }, "all", when).vendors.length, 0);
assert.equal(parseOverpassResponse({ elements: [{ ...node, tags: { name: "Bunga Party Shop", shop: "party" } }] }, "all", when).vendors.length, 0);
assert.equal(parseOverpassResponse({ elements: [{ ...node, tags: { name: "Bali Florist Studio", shop: "florist" } }] }, "all", when).vendors.length, 0);
assert.equal(parseOverpassResponse({ elements: [{ ...node, type: "way", lat: undefined, lon: undefined,
  center: { lat: node.lat, lon: node.lon } }] }, "all", when).vendors.length, 1);
assert.throws(() => parseOverpassResponse({ elements: [], remark: "runtime error" }, "all", when));
assert.throws(() => parseOverpassResponse({ places: [] }, "all", when));
assert.equal(parseOverpassResponse({ elements: Array(MAX_OSM_RESULTS).fill(node) }, "all", when).limited, true);
assert.equal(sanitizeVendor({ ...parsed.vendors[0], updatedAt: "not-a-date" }), null);
assert.equal(sanitizeVendor({ ...parsed.vendors[0], sourceUrl: "javascript:alert(1)" }).sourceUrl, undefined);

assert.equal(parseSearchBounds(null), undefined);
assert.throws(() => parseSearchBounds("0,0,1,1"));
assert.throws(() => parseSearchBounds("-8,115,-9,116"));
assert.throws(() => parseSearchBounds("-8,NaN,0,1"));
assert.throws(() => parseSearchBounds("-8,114,115"));
assert.throws(() => buildOverpassQuery("Gianyar", [-8.3, 114.3, -8.2, 114.4]));
assert.match(buildOverpassQuery("all"), /out center tags 600/);
assert.doesNotMatch(buildOverpassQuery("all"), /Infinity|NaN/);

const originalFetch = globalThis.fetch;
const originalNow = Date.now;
let clock = Date.now();
let calls = 0;
Date.now = () => clock;
try {
  globalThis.fetch = async () => { calls++; return new Response(JSON.stringify(raw)); };
  const [first, same] = await Promise.all([searchOpenStreetMap("Denpasar"), searchOpenStreetMap("Denpasar")]);
  assert.deepEqual(first, same);
  assert.equal(calls, 1, "Concurrent identical searches share one upstream request");
  await searchOpenStreetMap("Denpasar");
  assert.equal(calls, 1, "A cached search does not query the public service again");
  await assert.rejects(searchOpenStreetMap("Gianyar"), (error) => error.status === 429);
  clock += 3001;
  globalThis.fetch = async () => new Response("", { status: 429 });
  await assert.rejects(searchOpenStreetMap("Gianyar"), (error) => error.status === 429);
  clock += 3001;
  globalThis.fetch = async () => { throw new Error("network timeout"); };
  await assert.rejects(searchOpenStreetMap("Badung"), (error) => error.status === 503);
  clock += 3001;
  globalThis.fetch = async () => new Response("not json");
  await assert.rejects(searchOpenStreetMap("Bangli"), (error) => error.status === 502);
  clock += 3001;
  globalThis.fetch = async () => new Response("", { headers: { "content-length": "6000000" } });
  await assert.rejects(searchOpenStreetMap("Tabanan"), (error) => error.status === 502);
} finally {
  globalThis.fetch = originalFetch;
  Date.now = originalNow;
}

console.log("OpenStreetMap parsing, administrative regions, cache, concurrency and failure checks passed.");
