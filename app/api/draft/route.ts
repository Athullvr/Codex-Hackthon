import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const systemPrompt = `You are drafting a formal civic complaint for submission to Kochi Municipal Corporation's MyKochi portal. Given the issue type, severity, department, and location, write: 1. A short subject line (under 10 words) 2. A formal complaint description in English (2-3 sentences, clear and direct, stating issue, location, and requesting action) 3. The same complaint in formal natural Malayalam, not literal translation. Respond only with valid JSON: { "subject": string, "descriptionEnglish": string, "descriptionMalayalam": string }`;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OpenAI is not configured." }, { status: 503 });
    const body = await request.json();
    if (!body?.issueType || !body?.severity || !body?.department) return NextResponse.json({ error: "Issue context is required." }, { status: 400 });
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({ model: "gpt-4o", temperature: 0.35, response_format: { type: "json_object" }, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(body) }] });
    const parsed = JSON.parse((completion.choices[0]?.message.content ?? "").replace(/^```json\s*|\s*```$/g, "").trim());
    if (![parsed.subject, parsed.descriptionEnglish, parsed.descriptionMalayalam].every((value) => typeof value === "string" && value.trim())) throw new Error("Invalid AI response");
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Draft generation failed", error);
    return NextResponse.json({ error: "We could not draft the complaint. Please try again." }, { status: 502 });
  }
}
