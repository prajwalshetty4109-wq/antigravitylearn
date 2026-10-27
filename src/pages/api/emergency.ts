import type { NextApiRequest, NextApiResponse } from 'next';
import { emergencySchema } from '@/lib/validators';
import { addEmergencyCase, getClinicState } from '@/lib/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const parseResult = emergencySchema.safeParse(req.body || {});
    const input = parseResult.success ? parseResult.data : undefined;

    const token = await addEmergencyCase(input);
    const updatedState = await getClinicState();

    return res.status(200).json({
      success: true,
      data: {
        token,
        state: updatedState,
      },
    });
  } catch (error: any) {
    console.error('[API /api/emergency] Emergency trigger error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to trigger emergency case',
    });
  }
}
