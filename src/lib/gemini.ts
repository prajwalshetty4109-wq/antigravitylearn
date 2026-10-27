import { GoogleGenAI } from '@google/genai';
import { TriageAiOutput, TriageInput } from './types';
import { predictFallbackTriage, triageAiOutputSchema } from './validators';

const apiKey = process.env.GEMINI_API_KEY;

export const isGeminiConfigured = Boolean(apiKey && apiKey.trim().length > 10);

let genaiClient: GoogleGenAI | null = null;
if (isGeminiConfigured) {
  try {
    genaiClient = new GoogleGenAI({ apiKey: apiKey! });
  } catch (err) {
    console.warn('[MediFlow] Failed to initialize GoogleGenAI client:', err);
    genaiClient = null;
  }
}

const SYSTEM_PROMPT = `You are the MediFlow AI Clinical Triage Engine. Analyze patient symptoms and return strict JSON with urgency_level, priority_score, estimated_mins, and ai_note.

Clinical Guidelines:
- urgency_level must be one of: "ROUTINE", "MODERATE", "CRITICAL"
- priority_score must be an integer between 1 and 100:
    * ROUTINE: 10 - 30 (stable, minor illnesses, chronic follow-ups)
    * MODERATE: 40 - 70 (fever, moderate pain, sprains, respiratory infections)
    * CRITICAL: 80 - 100 (acute chest pain, dyspnea, stroke signs, severe trauma, shock)
- estimated_mins is the estimated physician consultation duration in minutes (5 to 45 mins).
- ai_note is a concise clinical triage assessment (1-2 sentences) highlighting primary indicators and recommended triage priority.

Output ONLY valid JSON matching this schema:
{
  "urgency_level": "MODERATE",
  "priority_score": 60,
  "estimated_mins": 15,
  "ai_note": "Prioritized for elevated symptoms. Estimated wait is 12 mins."
}`;

export async function runGeminiTriage(input: TriageInput): Promise<TriageAiOutput> {
  if (!genaiClient) {
    console.info('[MediFlow] GEMINI_API_KEY not set or invalid. Using intelligent clinical fallback heuristic.');
    return predictFallbackTriage(input);
  }

  const prompt = `Patient Triage Intake Assessment:
- Name: ${input.patient_name}
- Age: ${input.age} years
- Target Department: ${input.department}
- Reported Symptoms: "${input.symptoms}"

Analyze the clinical acuity, calculate priority score and consultation duration, and return JSON.`;

  try {
    const response = await genaiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '';
    if (!responseText) {
      throw new Error('Empty response received from Gemini');
    }

    // Parse JSON
    const parsed = JSON.parse(responseText);
    const validated = triageAiOutputSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error('[MediFlow] Gemini 2.5 Flash triage generation error. Falling back safely:', error);
    return predictFallbackTriage(input);
  }
}
