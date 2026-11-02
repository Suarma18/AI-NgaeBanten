const https = require('https');

async function resolveAndFetch(label, url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    console.log(`\n================== ${label} ==================`);
    console.log(`Original URL: ${url}`);
    console.log(`Final URL: ${res.url}`);
    const text = await res.text();
    
    // Look for og:title or title
    const title = text.match(/<title>([^<]+)<\/title>/i);
    const ogTitle = text.match(/<meta content="([^"]+)" property="og:title"/i) || text.match(/<meta property="og:title" content="([^"]+)"/i);
    const ogDesc = text.match(/<meta content="([^"]+)" property="og:description"/i) || text.match(/<meta property="og:description" content="([^"]+)"/i);
    
    console.log(`Title: ${title ? title[1] : 'N/A'}`);
    console.log(`OG Title: ${ogTitle ? ogTitle[1] : 'N/A'}`);
    console.log(`OG Desc: ${ogDesc ? ogDesc[1] : 'N/A'}`);

    // Look for place mentions or coordinates in window.APP_INITIALIZATION_STATE
    const coordMatches = [...text.matchAll(/\[null,null,(-8\.\d+),(115\.\d+)\]/g)].slice(0, 5);
    if (coordMatches.length > 0) {
      console.log('Coordinates found:');
      coordMatches.forEach(m => console.log(`  -> Lat: ${m[1]}, Lng: ${m[2]}`));
    }
  } catch (err) {
    console.error(`Error for ${label}:`, err.message);
  }
}

async function run() {
  await resolveAndFetch('1. Toko Banten Denpasar', 'https://maps.app.goo.gl/vP5dHZW2z7c4DXVq7');
  await resolveAndFetch('2. Toko Canang Denpasar', 'https://maps.app.goo.gl/rPZ3cqXUNyoSzoXN6');
  await resolveAndFetch('3. Toko Dupa Denpasar', 'https://maps.app.goo.gl/YzfJWw6T8VcpYVPW7');
  await resolveAndFetch('4. Jero Mangku Daerah Denpasar', 'https://maps.app.goo.gl/MDZN96MwayYrRpTAA');
}

run();
