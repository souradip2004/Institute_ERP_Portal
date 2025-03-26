import { NextApiRequest, NextApiResponse } from 'next';
import { getAllInstitutions, createInstitution } from '@/lib/institutionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const institutions = await getAllInstitutions();
      return res.status(200).json(institutions);
    }

    if (req.method === 'POST') {
      const data = req.body;
      const institution = await createInstitution(data);
      return res.status(201).json(institution);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}