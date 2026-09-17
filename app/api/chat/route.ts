import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { requireVendor } from "@/lib/auth";
import { searchBazaarsForChat } from "@/lib/chat-assistant";
import type { Content } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SEARCH_TOOL = {
  functionDeclarations: [
    {
      name: "search_bazaar",
      description:
        "Search for active bazaars that vendors can apply to, filtered by category, city, and max price per slot.",
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        tools: [SEARCH_TOOL],
      },
    });

    const functionCall = response.functionCalls?.[0];
    let searchResults = null;

    if (functionCall && functionCall.name === "search_bazaars") {
      const args = functionCall.args as {
        category?: string;
        city?: string;
        maxPrice?: number;
      };
      searchResults = await searchBazaarsForChat(args);

      const followUpContents: Content[] = [
        ...contents,
        { role: "model", parts: [{ functionCall }] },
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

      const followUp = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: followUpContents,
        config: { systemInstruction, tools: [SEARCH_TOOL] },
      });

      return NextResponse.json({
        text: followUp.text || "",
        bazaars: searchResults,
      });
    }

    return NextResponse.json({
      text: response.text || "",
      bazaars: null,
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
