import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface PreVisitResult {
  urgencyLevel: "Low" | "Medium" | "High";
  chiefComplaint: string;
  suggestedQuestions: string[];
  summary: string;
}

interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PostVisitResult {
  summary: string;
  medicationSchedule: MedicationItem[];
  followUpSteps: string[];
  warnings: string[];
}

async function callGemini(prompt: string, retries = 1): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error(`Gemini API attempt ${attempt + 1} failed:`, error);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  throw new Error("Gemini API failed after retries");
}

function extractJson(text: string): string {
  // Strip markdown code fences if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  // Try finding JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text;
}

export async function generatePreVisitSummary(
  symptoms: string
): Promise<PreVisitResult | null> {
  try {
    const prompt = `You are a medical triage assistant. Analyse these patient symptoms and return ONLY a JSON object (no markdown, no explanation) with these exact fields:
- "urgencyLevel": one of "Low", "Medium", or "High"
- "chiefComplaint": a brief string describing the main complaint
- "suggestedQuestions": an array of exactly 3 strings, each a question the doctor should ask
- "summary": a 2-3 sentence clinical summary

Patient symptoms: "${symptoms}"

Return ONLY valid JSON, nothing else.`;

    const text = await callGemini(prompt);
    const json = extractJson(text);
    const parsed = JSON.parse(json) as PreVisitResult;

    // Validate shape
    if (
      !parsed.urgencyLevel ||
      !parsed.chiefComplaint ||
      !Array.isArray(parsed.suggestedQuestions) ||
      !parsed.summary
    ) {
      throw new Error("Invalid LLM response shape");
    }

    return parsed;
  } catch (error) {
    console.error("Pre-visit summary generation failed:", error);
    return null;
  }
}

export async function generatePostVisitSummary(
  notes: string,
  prescription: string
): Promise<PostVisitResult | null> {
  try {
    const prompt = `You are a medical communication assistant. Convert these clinical notes into a patient-friendly summary. Return ONLY a JSON object (no markdown, no explanation) with these exact fields:
- "summary": a clear, easy-to-understand explanation of the diagnosis and findings (2-3 sentences, avoid medical jargon)
- "medicationSchedule": an array of objects, each with "name", "dosage", "frequency", "duration", and "instructions" fields
- "followUpSteps": an array of strings describing next steps for the patient
- "warnings": an array of strings describing symptoms that need immediate medical attention

Clinical notes: "${notes}"
Prescription: "${prescription}"

Return ONLY valid JSON, nothing else.`;

    const text = await callGemini(prompt);
    const json = extractJson(text);
    const parsed = JSON.parse(json) as PostVisitResult;

    if (
      !parsed.summary ||
      !Array.isArray(parsed.medicationSchedule) ||
      !Array.isArray(parsed.followUpSteps) ||
      !Array.isArray(parsed.warnings)
    ) {
      throw new Error("Invalid LLM response shape");
    }

    return parsed;
  } catch (error) {
    console.error("Post-visit summary generation failed:", error);
    return null;
  }
}
