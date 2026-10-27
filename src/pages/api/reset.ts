import type { NextApiRequest, NextApiResponse } from 'next';
import { resetClinicDemo, getClinicState } from '@/lib/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    await resetClinicDemo();
    const freshState = await getClinicState();

    return res.status(200).json({
      success: true,
      message: 'MediFlow 3D demo reset to fresh state',
      data: freshState,
    });
  } catch (error: any) {
    console.error('[API /api/reset] Reset demo error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to reset demo state',
    });
  }
}
