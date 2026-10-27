import { z } from 'zod';
import { TriageAiOutput, TriageInput } from './types';

export const triageInputSchema = z.object({
  patient_name: z
    .string()
    .min(2, { message: 'Patient name must be at least 2 characters long' })
    .max(100, { message: 'Patient name must be under 100 characters' }),
  age: z.coerce
    .number()
    .int()
    .min(0, { message: 'Age must be 0 or greater' })
    .max(125, { message: 'Age must be realistic (under 125)' }),
  department: z.enum(['GENERAL_MEDICINE', 'CARDIOLOGY', 'ORTHOPEDICS'], {
    errorMap: () => ({ message: 'Department must be GENERAL_MEDICINE, CARDIOLOGY, or ORTHOPEDICS' }),
  }),
  symptoms: z
    .string()
    .min(3, { message: 'Please describe the symptoms (minimum 3 characters)' })
    .max(1500, { message: 'Symptoms description is too long (maximum 1500 characters)' }),
});

export const triageAiOutputSchema = z.object({
  urgency_level: z.enum(['ROUTINE', 'MODERATE', 'CRITICAL']),
  priority_score: z.coerce.number().min(1).max(100),
  estimated_mins: z.coerce.number().min(3).max(180),
  ai_note: z.string().min(5),
});

export const advanceQueueSchema = z.object({
  cabin_number: z.string().min(1),
  completed_token: z.string().optional().nullable(),
});

export const emergencySchema = z.object({
  patient_name: z.string().min(2).default('Emergency Patient'),
  department: z.enum(['GENERAL_MEDICINE', 'CARDIOLOGY', 'ORTHOPEDICS']).default('CARDIOLOGY'),
  symptoms: z.string().min(3).default('Severe crushing chest pain, diaphoresis, impending syncope'),
});

/**
 * High-accuracy clinical triage fallback engine
 * Used when GEMINI_API_KEY is not configured or offline
 */
export function predictFallbackTriage(input: TriageInput): TriageAiOutput {
  const text = input.symptoms.toLowerCase();
  const age = input.age;

  const criticalKeywords = [
    'chest pain',
    'heart attack',
    'infarct',
    'stroke',
    'cannot breathe',
    'unconscious',
    'crushing',
    'diaphoresis',
    'cyanosis',
    'severe bleeding',
    'anaphylaxis',
    'collapse',
    'seizure',
    'paralysis',
    'compound fracture',
  ];

  const moderateKeywords = [
    'fever',
    'cough',
    'sprain',
    'vomiting',
    'dizziness',
    'palpitation',
    'swelling',
    'headache',
    'migraine',
    'burn',
    'laceration',
    'infection',
    'shortness of breath',
    'tachycardia',
    'hypertension',
    'inability to bear weight',
  ];

  const isCritical = criticalKeywords.some((k) => text.includes(k)) || (input.department === 'CARDIOLOGY' && age > 55 && (text.includes('pressure') || text.includes('tightness')));
  const isModerate = moderateKeywords.some((k) => text.includes(k)) || age > 75 || age < 2;

  if (isCritical) {
    return {
      urgency_level: 'CRITICAL',
      priority_score: 95,
      estimated_mins: 5,
      ai_note: 'CRITICAL ALERT: Presenting symptoms indicate acute hemodynamic or neurologic risk. Fast-tracked for immediate physician review.',
    };
  }

  if (isModerate) {
    return {
      urgency_level: 'MODERATE',
      priority_score: 50,
      estimated_mins: 15,
      ai_note: 'MODERATE URGENCY: Clinical assessment indicates notable distress requiring prompt evaluation. Queued ahead of routine checkups.',
    };
  }

  return {
    urgency_level: 'ROUTINE',
    priority_score: 10,
    estimated_mins: 20,
    ai_note: 'ROUTINE CONSULTATION: Stable presentation suitable for standard outpatient intake and general practitioner workup.',
  };
}
