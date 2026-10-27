import type { NextApiRequest, NextApiResponse } from 'next';
import { triageInputSchema } from '@/lib/validators';
import { runGeminiTriage } from '@/lib/gemini';
import { createPatientToken, getClinicState } from '@/lib/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const parseResult = triageInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const input = parseResult.data;

    // 1. Run AI Clinical Triage via Gemini 2.5 Flash (or smart clinical heuristic if offline)
    const triageAnalysis = await runGeminiTriage(input);

    // 2. Persist new queue token
    const token = await createPatientToken(input, triageAnalysis);

    // 3. Get updated state
    const state = await getClinicState();

    return res.status(200).json({
      success: true,
      data: {
        token,
        triage: triageAnalysis,
        queueLength: state.queue.length,
      },
    });
  } catch (error) {
    console.error('[API /api/triage] Triage error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process AI patient triage',
    });
  }
}
