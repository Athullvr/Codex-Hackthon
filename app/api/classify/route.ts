import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const systemPrompt = `You are a civic issue triage assistant for Kochi Municipal Corporation. Given a photo of a civic problem, identify: 1. The issue type (e.g. pothole, garbage accumulation, broken streetlight, water leak, blocked drain, etc.) 2. Severity: "low", "medium", or "high" based on visible safety risk, scale, and likely impact. 3. The responsible department, choosing exactly one of: "Engineering" (roads, streetlights, drains, infrastructure), "Health" (garbage, sanitation, public health hazards), "Revenue" (property-related, encroachment, other administrative issues). Respond only with valid JSON: { "issueType": string, "severity": "low"|"medium"|"high", "department": "Engineering"|"Health"|"Revenue" }`;

function parseJson(content: string) {
  const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, "").trim());
  if (!parsed.issueType || !["low", "medium", "high"].includes(parsed.severity) || !["Engineering", "Health", "Revenue"].includes(parsed.department)) throw new Error("Invalid AI response");
  return parsed;
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OpenAI is not configured." }, { status: 503 });
    const { image } = await request.json();
    if (typeof image !== "string" || !image.startsWith("data:image/")) return NextResponse.json({ error: "A valid image is required." }, { status: 400 });
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({ model: "gpt-4o", temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: [{ type: "text", text: "Classify this civic issue." }, { type: "image_url", image_url: { url: image } }] }] });
    return NextResponse.json(parseJson(completion.choices[0]?.message.content ?? ""));
  } catch (error) {
    console.error("Classification failed", error);
    return NextResponse.json({ error: "We could not analyze that image. Please try again." }, { status: 502 });
  }
}
