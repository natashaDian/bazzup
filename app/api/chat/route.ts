import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { requireVendor } from "@/lib/auth";
import { searchBazaarsForChat } from "@/lib/chat-assistant";
import type { Content } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SEARCH_TOOL = {
  functionDeclarations: [
    {
      name: "search_bazaars",
      description:
        "Cari bazaar aktif di database BazzUp yang bisa dilamar vendor. " +
        "WAJIB dipanggil setiap kali user menanyakan bazaar, event, tempat " +
        "berjualan, harga slot, atau lokasi — meskipun pertanyaannya umum. " +
        "Jangan menjawab soal bazaar dari pengetahuan sendiri.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description:
              "Business category, e.g. F&B, Fashion, Lifestyle, Beauty, Services",
          },
          city: {
            type: Type.STRING,
            description: "City name to search in",
          },
          maxPrice: {
            type: Type.NUMBER,
            description: "Maximum price per slot in Indonesian Rupiah",
          },
        },
      },
    },
  ],
};

type GeminiContent = {
  role: "user" | "model";
  parts: Array<{
    text?: string;
    functionCall?: unknown;
    functionResponse?: unknown;
  }>;
};

export async function POST(req: Request) {
  const user = await requireVendor();
  const { messages } = await req.json();

const systemInstruction = `You are a helpful bazaar-finding assistant for BazzUp, a marketplace connecting bazaar organizers with vendors.
The vendor you're talking to sells: ${user.businessType || "unknown category"}.
Help them find bazaars that match what they're looking for using the search_bazaars tool.
Call search_bazaars as soon as the vendor mentions anything about what they sell, their city, or budget — don't ask clarifying questions first, just search with whatever you have.
You have NO built-in knowledge about any bazaar. Every piece of bazaar information must come from the search_bazaars tool.
If the vendor asks anything about bazaars, events, slots, prices, or locations, you MUST call search_bazaars first before answering — even if the question is vague or general. Call it with no arguments if you have nothing specific to filter on.
Always respond in Indonesian, in a friendly and concise way.
Do NOT use markdown formatting like asterisks or bullet points, just write in plain natural sentences.
When you find matching bazaars, briefly explain why each one fits before the app shows the details.
Keep your text responses short (1-3 sentences), the actual bazaar cards will be shown separately by the app.`;

  const contents: Content[] = messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }),
  );

  const MAX_TOOL_ROUNDS = 3;

  try {
    let turnContents = contents;
    let searchResults = null;

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: turnContents,
        config: {
          systemInstruction,
          tools: [SEARCH_TOOL],
        },
      });

      console.log("functionCalls:", JSON.stringify(response.functionCalls));

      const functionCall = response.functionCalls?.[0];

      if (!functionCall || functionCall.name !== "search_bazaars") {
        return NextResponse.json({
          text:
            response.text ||
            (searchResults
              ? "Maaf, belum nemu bazaar yang cocok. Coba kategori, kota, atau budget lain ya."
              : ""),
          bazaars: searchResults,
        });
      }

      const args = functionCall.args as {
        category?: string;
        city?: string;
        maxPrice?: number;
      };
      searchResults = await searchBazaarsForChat(args);

      turnContents = [
        ...turnContents,
        response.candidates![0].content!,
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: "search_bazaars",
                response: { results: searchResults },
              },
            },
          ],
        },
      ];
    }

    return NextResponse.json({
      text: "Maaf, belum nemu bazaar yang cocok. Coba kategori, kota, atau budget lain ya.",
      bazaars: searchResults,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const isRateLimit =
      message.includes("429") ||
      message.toLowerCase().includes("resource_exhausted") ||
      message.toLowerCase().includes("quota");

    return NextResponse.json(
      {
        text: isRateLimit
          ? "Lagi banyak yang pakai asisten ini nih, coba lagi sebentar ya (sekitar 1 menit)."
          : "Waduh, ada gangguan di sistem. Coba lagi ya.",
        bazaars: null,
        error: true,
      },
      { status: isRateLimit ? 429 : 500 },
    );
  }
}
