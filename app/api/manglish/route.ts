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

function extractJson(content: string) {
  const start = content.indexOf("{");
  if (start === -1) throw new Error("The AI response was not in the expected format.");

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < content.length; index += 1) {
    const character = content[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return JSON.parse(content.slice(start, index + 1));
    }
  }
  throw new Error("The AI response was incomplete.");
}

function createFallbackReport(text: string, location: string) {
  const normalized = text.toLowerCase();
  const isHealthIssue = /garbage|waste|trash|sewage|mosquito|sanitation/.test(normalized);
  const isRevenueIssue = /tax|property|land|encroach/.test(normalized);
  const issueType = /pothole/.test(normalized) ? "Pothole" : /street.?light|light/.test(normalized) ? "Broken streetlight" : /drain/.test(normalized) ? "Blocked drain" : isHealthIssue ? "Sanitation issue" : isRevenueIssue ? "Property or revenue issue" : "Civic infrastructure issue";
  const severity = /danger|accident|urgent|risk|deep|flood/.test(normalized) ? "high" : "medium";
  const department = isHealthIssue ? "Health" : isRevenueIssue ? "Revenue" : "Engineering";
  const place = location || "the selected ward";

  return {
    issueType,
    severity,
    department,
    subject: `${issueType} at ${place}`.slice(0, 72),
    descriptionEnglish: `A ${issueType.toLowerCase()} has been reported at ${place}. The issue may affect public safety and daily movement. Kindly inspect the location and take the necessary action at the earliest.`,
    descriptionMalayalam: `${place} പ്രദേശത്ത് ${issueType.toLowerCase()} റിപ്പോർട്ട് ചെയ്തിട്ടുണ്ട്. ഇത് പൊതുസുരക്ഷയെയും യാത്രാസൗകര്യത്തെയും ബാധിക്കാനിടയുണ്ട്. സ്ഥലം പരിശോധിച്ച് അടിയന്തരമായി ആവശ്യമായ നടപടി സ്വീകരിക്കണമെന്നു അപേക്ഷിക്കുന്നു.`,
  };
}

export async function POST(request: Request) {
  let reportText = "";
  let reportLocation = "";
  try {
    const { text, location } = await request.json();
    if (typeof text !== "string" || !text.trim()) return NextResponse.json({ error: "Text description is required." }, { status: 400 });
    reportText = text;
    reportLocation = typeof location === "string" ? location : "";
    if (!process.env.GEMINI_API_KEY) return NextResponse.json(createFallbackReport(text, location));
    
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
    const parsed = extractJson(content);
    if (!parsed || typeof parsed !== "object" || !["low", "medium", "high"].includes(parsed.severity) || !["Engineering", "Health", "Revenue"].includes(parsed.department) || ![parsed.issueType, parsed.subject, parsed.descriptionEnglish, parsed.descriptionMalayalam].every((value) => typeof value === "string" && value.trim())) {
      throw new Error("The AI response was missing report details.");
    }
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Manglish analysis failed", error);
    if (reportText) return NextResponse.json(createFallbackReport(reportText, reportLocation));
    return NextResponse.json({ error: "We couldn't create the report right now. Please try again in a moment." }, { status: 502 });
  }
}
