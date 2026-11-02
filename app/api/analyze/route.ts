import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResponse } from "../../../lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

// In-memory sliding window rate limiter: max 10 requests per minute per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(ip, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);

  // Periodic cleanup if map grows
  if (rateLimitMap.size > 1000) {
    for (const [key, times] of rateLimitMap.entries()) {
      const active = times.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (active.length === 0) rateLimitMap.delete(key);
      else rateLimitMap.set(key, active);
    }
  }

  return true;
}

const geminiResponseSchema = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          quantity: { type: "NUMBER", nullable: true },
          unit: { type: "STRING" },
          note: { type: "STRING" },
          needs_confirmation: { type: "BOOLEAN" }
        },
        required: ["name", "unit", "note", "needs_confirmation"]
      }
    },
    questions: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["summary", "items", "questions"]
};

function isValidResult(value: unknown): value is AnalysisResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.summary !== "string" || !Array.isArray(v.items) || !Array.isArray(v.questions)) return false;
  if (v.items.length > 50 || v.questions.length > 12) return false;
  return (
    v.items.every((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const i = entry as Record<string, unknown>;
      return (
        typeof i.name === "string" &&
        i.name.trim().length > 0 &&
        i.name.length < 180 &&
        (i.quantity === null ||
          i.quantity === undefined ||
          (typeof i.quantity === "number" && Number.isFinite(i.quantity) && i.quantity > 0 && i.quantity <= 100000)) &&
        typeof i.unit === "string" &&
        typeof i.note === "string" &&
        typeof i.needs_confirmation === "boolean"
      );
    }) && v.questions.every((q) => typeof q === "string")
  );
}

export async function POST(req: NextRequest) {
  // Rate limiting check
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan analisis. Mohon tunggu 1 menit sebelum mencoba lagi." },
      { status: 429 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const requestedModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";

  try {
    const body = await req.json();
    const userText = typeof body.text === "string" ? body.text.trim() : "";
    const image = typeof body.imageDataUrl === "string" ? body.imageDataUrl : "";

    // Fast O(1) header validation for base64 images (avoids ReDoS on 4MB payload)
    const isSupportedImage =
      !image ||
      image.startsWith("data:image/jpeg;base64,") ||
      image.startsWith("data:image/png;base64,") ||
      image.startsWith("data:image/webp;base64,");

    if (userText.length > 5000 || image.length > 4_000_000 || !isSupportedImage) {
      return NextResponse.json(
        { error: "Input terlalu besar atau format foto tidak didukung (gunakan JPG, PNG, atau WebP)." },
        { status: 400 }
      );
    }

    if (!userText && !image) {
      return NextResponse.json(
        { error: "Mohon masukkan catatan atau unggah foto daftar kebutuhan terlebih dahulu." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Layanan AI belum dikonfigurasi. Minta pengelola mengatur GEMINI_API_KEY di berkas .env.local. Anda tetap bisa menambah bahan secara manual."
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Build Gemini multimodal parts
    const parts: Array<Record<string, unknown>> = [];
    parts.push({
      text: `CATATAN PENGGUNA:\n${userText || "(Tidak ada teks, baca rincian kebutuhan dari foto kertas catatan terlampir)"}`
    });

    if (image) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    const geminiPayload = {
      systemInstruction: {
        parts: [
          {
            text: `Anda adalah asisten ekstraksi catatan kebutuhan banten upakara yadnya di Bali.
Tugas Anda HANYA membaca dan mengubah catatan teks atau foto tulisan tangan menjadi daftar item bahan/banten yang secara eksplisit terlihat atau tertulis.
ATURAN UTAMA:
1. BUKAN tugas Anda untuk menentukan atau memvonis sarana upakara.
2. Jangan menambah-nambah bahan, kuantitas, atau mengarang asal-usul ritual yang tidak tertulis.
3. Jika angka atau jumlah tidak jelas/tidak disebutkan, gunakan quantity: null, unit: "", needs_confirmation: true, dan buat pertanyaan konfirmasi yang spesifik pada bagian questions.
4. Pertahankan istilah lokal Bali sesuai catatan asli (misal: canang sari, pejati, daksina, suci, katih, tanding, ceper, tamas, kelapa, slepan, janur, bunga sandat, bunga cempaka).
5. Bedakan paket banten jadi (siap pakai) dengan bahan mentah upakara.
6. Output HARUS dalam format JSON valid sesuai skema yang ditentukan, dalam Bahasa Indonesia yang ringkas dan santun. Maksimal 30 item.`
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: geminiResponseSchema,
        temperature: 0.2
      }
    };

    // Helper to call Gemini endpoint with fallback support
    async function callGemini(modelName: string) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      return fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
        signal: AbortSignal.timeout(15000),
        cache: "no-store"
      });
    }

    // Try requested model first, then ultra-fast fallback models if busy/deprecated
    const modelsToTry = Array.from(
      new Set([requestedModel, "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash"])
    );

    let upstream: Response | null = null;

    for (const modelName of modelsToTry) {
      try {
        const res = await callGemini(modelName);
        if (res.ok) {
          upstream = res;
          break;
        }
        if (res.status === 401 || res.status === 403) {
          upstream = res;
          break;
        }
        console.warn(`[analyze] Model ${modelName} returned status ${res.status}, trying fallback...`);
      } catch (err) {
        console.warn(`[analyze] Call to ${modelName} failed or timed out:`, err);
      }
    }

    if (!upstream || !upstream.ok) {
      const status = upstream?.status || 502;
      console.error("[analyze] Google Gemini request failed", { status });

      if (status === 401 || status === 403) {
        return NextResponse.json(
          {
            error:
              "API key Gemini tidak valid atau ditolak Google. Periksa nilai GEMINI_API_KEY di .env.local. Anda tetap bisa menambah bahan secara manual."
          },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }

      if (status === 429) {
        return NextResponse.json(
          { error: "Batas kuota layanan Gemini sedang tercapai. Coba kembali beberapa saat lagi." },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { error: "Layanan analisis AI Gemini sedang tidak dapat dihubungi. Coba lagi beberapa saat lagi." },
        { status: 502 }
      );
    }

    const jsonResponse = (await upstream.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json(
        { error: "Model Gemini tidak menghasilkan data yang dapat digunakan." },
        { status: 502 }
      );
    }

    const parsedResult: unknown = JSON.parse(text);
    if (!isValidResult(parsedResult)) {
      return NextResponse.json(
        { error: "Hasil analisis AI belum memenuhi format data terstruktur. Silakan coba kembali." },
        { status: 502 }
      );
    }

    // Ensure quantity is null if undefined or null
    const sanitizedItems = parsedResult.items.map((item) => ({
      ...item,
      quantity: item.quantity ?? null,
      unit: item.unit || "",
      note: item.note || "",
      needs_confirmation: Boolean(item.needs_confirmation)
    }));

    return NextResponse.json(
      {
        summary: parsedResult.summary,
        items: sanitizedItems,
        questions: parsedResult.questions
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
    }
    return NextResponse.json({ error: "Analisis gagal. Periksa koneksi dan coba lagi." }, { status: 500 });
  }
}
