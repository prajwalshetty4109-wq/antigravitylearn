import type { NextApiRequest, NextApiResponse } from 'next';
import { getClinicState } from '@/lib/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const state = await getClinicState();
    return res.status(200).json({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('[API /api/state] Error fetching clinic state:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve clinic state',
    });
  }
}
