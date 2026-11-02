import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// Next resolves this extensionless import when bundling; Node needs the .js suffix.
registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === "next/server" ? "next/server.js" : specifier, context);
  }
});
const { NextRequest } = await import("next/server.js");
const { POST } = await import("../app/api/analyze/route.ts");
const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const originalError = console.error;
const logs = [];
let requestCount = 0;

async function analyze(text = "Canang 2 buah") {
  return POST(new NextRequest("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `test-${++requestCount}` },
    body: JSON.stringify({ text })
  }));
}

try {
  process.env.GEMINI_API_KEY = "test-only-key";
  console.error = (...args) => logs.push(args);

  // 1. Invalid / rejected key test (401 / 403)
  globalThis.fetch = async () => new Response(JSON.stringify({
    error: { code: 401, message: "API_KEY_INVALID: SECRET_PROVIDER_MESSAGE", status: "UNAUTHENTICATED" }
  }), { status: 401, headers: { "Content-Type": "application/json" } });

  const invalid = await analyze();
  assert.equal(invalid.status, 503);
  const invalidBody = await invalid.json();
  assert.match(invalidBody.error, /tidak valid/i);
  assert.match(invalidBody.error, /manual/i);
  assert.doesNotMatch(JSON.stringify(invalidBody), /SECRET_PROVIDER_MESSAGE|test-only-key/);
  assert.doesNotMatch(JSON.stringify(logs), /SECRET_PROVIDER_MESSAGE|test-only-key/);

  // 2. Missing key test
  delete process.env.GEMINI_API_KEY;
  globalThis.fetch = async () => { throw new Error("Must not call provider without a key"); };
  const missing = await analyze();
  assert.equal(missing.status, 503);
  const missingBody = await missing.json();
  assert.match(missingBody.error, /belum dikonfigurasi/i);
  assert.equal(missingBody.items, undefined);

  // 3. Empty input validation (400)
  const empty = await analyze("");
  assert.equal(empty.status, 400);

  // 4. Successful Gemini structured extraction test (200)
  process.env.GEMINI_API_KEY = "test-only-key";
  const result = {
    summary: "Dua canang.",
    items: [{ name: "Canang", quantity: 2, unit: "buah", note: "", needs_confirmation: false }],
    questions: []
  };

  globalThis.fetch = async (url, options) => {
    assert.match(url, /generativelanguage\.googleapis\.com\/v1beta\/models\/.*:generateContent/);
    const parsedBody = JSON.parse(options.body);
    assert.equal(parsedBody.generationConfig.responseMimeType, "application/json");
    return Response.json({
      candidates: [
        {
          content: {
            parts: [{ text: JSON.stringify(result) }]
          }
        }
      ]
    });
  };

  const success = await analyze();
  assert.equal(success.status, 200);
  assert.deepEqual(await success.json(), result);
  assert.equal(success.headers.get("Cache-Control"), "no-store");
  console.log("Gemini API route checks passed (invalid/missing key, validation, structured success, no secret leakage).");
} finally {
  globalThis.fetch = originalFetch;
  console.error = originalError;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
}
