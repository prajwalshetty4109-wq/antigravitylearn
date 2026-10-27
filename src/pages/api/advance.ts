import type { NextApiRequest, NextApiResponse } from 'next';
import { advanceQueueSchema } from '@/lib/validators';
import { advanceCabinQueue, getClinicState } from '@/lib/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const parseResult = advanceQueueSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { cabin_number } = parseResult.data;
    const result = await advanceCabinQueue(cabin_number);
    const updatedState = await getClinicState();

    return res.status(200).json({
      success: true,
      data: {
        cabin: result.cabin,
        nextPatient: result.nextPatient,
        state: updatedState,
      },
    });
  } catch (error: any) {
    console.error('[API /api/advance] Advance error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to advance patient queue',
    });
  }
}
