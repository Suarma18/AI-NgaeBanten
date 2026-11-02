import fs from 'node:fs';
import { parseOverpassResponse } from '../lib/vendors/overpass.ts';
import { sanitizeVendor } from '../lib/vendors/validation.ts';
import { regionForPoint } from '../lib/vendors/geography.ts';

const paths = process.argv.slice(2);
if (!paths.length) throw new Error('Usage: node scripts/import-osm-snapshot.mjs <raw-overpass.json> [...]');
let fetchedAt = new Date().toISOString();
const vendors = new Map();
const sourceDates = [];
for (const path of paths) {
  const raw = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (raw.source === 'openstreetmap' && Array.isArray(raw.vendors)) {
    if (raw.limited) throw new Error('The application response was limited; do not publish it as a complete snapshot.');
    if (!Number.isFinite(Date.parse(raw.fetchedAt))) throw new Error('Missing source retrieval date.');
    fetchedAt = raw.fetchedAt;
    for (const value of raw.vendors) {
      const vendor = sanitizeVendor(value);
      const match = vendor?.id.match(/^osm-(node|way|relation)-(\d+)$/);
      if (!vendor || !match || vendor.source !== 'openstreetmap' || vendor.isSampleFixture ||
        vendor.sourceUrl !== `https://www.openstreetmap.org/${match[1]}/${match[2]}`) throw new Error('Invalid OSM identity in application response.');
      const regency = regionForPoint(vendor.latitude, vendor.longitude);
      if (regency) vendors.set(vendor.id, { ...vendor, regency, verificationStatus: 'unverified', verifiedAt: undefined, products: [] });
    }
    continue;
  }
  const parsed = parseOverpassResponse(raw, 'all', fetchedAt);
  if (parsed.limited) throw new Error('Input exceeds the safe record limit; split the source query.');
  for (const vendor of parsed.vendors) vendors.set(vendor.id, vendor);
  if (raw.osm3s?.timestamp_osm_base) sourceDates.push(raw.osm3s.timestamp_osm_base);
}
if (!vendors.size) throw new Error('No valid Bali locations found; the existing directory was preserved.');
const priority = ['banten_jadi','bahan_banten','bunga_janur','buah_upakara','pasar_tradisional'];
const result = [...vendors.values()].sort((a,b)=>Math.min(...a.categories.map(c=>priority.indexOf(c)))-Math.min(...b.categories.map(c=>priority.indexOf(c)))||a.name.localeCompare(b.name,'id'));
fs.writeFileSync(new URL('../data/vendors.json', import.meta.url),JSON.stringify(result,null,2)+'\n');
const metadata = { source: 'OpenStreetMap contributors', license: 'ODbL-1.0', licenseUrl: 'https://www.openstreetmap.org/copyright', fetchedAt,
  sourceBaseTimestamps: [...new Set(sourceDates)], count: result.length, regencies: Object.fromEntries([...new Set(result.map(v=>v.regency))].sort().map(r=>[r,result.filter(v=>v.regency===r).length])),
  categories: Object.fromEntries(priority.map(c=>[c,result.filter(v=>v.categories.includes(c)).length])) };
fs.writeFileSync(new URL('../data/vendors.metadata.json', import.meta.url),JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify(metadata,null,2));
