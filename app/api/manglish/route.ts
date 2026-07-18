import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const systemPrompt = `You are a civic issue triage agent for Kochi Municipal Corporation.
Given a user's description of a civic problem (usually in Manglish/Malayalam-English), you must identify:
1. issueType (e.g., Broken Streetlight, Pothole, Garbage)
2. severity ("low", "medium", or "high")
3. department ("Engineering", "Health", or "Revenue")
4. subject (a short subject line under 10 words)
5. descriptionEnglish (a formal 2-3 sentence complaint in English)
6. descriptionMalayalam (the same complaint in formal Malayalam)

Respond ONLY with valid JSON in this exact shape:
{
  "issueType": string,
  "severity": "low"|"medium"|"high",
  "department": "Engineering"|"Health"|"Revenue",
  "subject": string,
  "descriptionEnglish": string,
  "descriptionMalayalam": string
}`;

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 503 });
    const { text, location } = await request.json();
    if (typeof text !== "string" || !text.trim()) return NextResponse.json({ error: "Text description is required." }, { status: 400 });
    
    const gemini = new OpenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai"
    });
    const completion = await gemini.chat.completions.create({ 
      model: "gemini-3.5-flash", 
      temperature: 0.35, 
      response_format: { type: "json_object" }, 
      messages: [
        { role: "system", content: systemPrompt }, 
        { role: "user", content: `Location: ${location || "Unknown"}\n\nDescription: ${text}` }
      ] 
    });
    
    const content = completion.choices[0]?.message.content ?? "";
    const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, "").trim());
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Manglish analysis failed", error);
    return NextResponse.json({ error: (error as Error).message || "We could not analyze the text. Please try again." }, { status: 502 });
  }
}
