import { NextApiRequest, NextApiResponse } from 'next';
import { getInstitutionById, updateInstitution, deleteInstitution } from '@/lib/institutionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  try {
    if (req.method === 'GET') {
      const institution = await getInstitutionById(id);
      if (!institution) return res.status(404).json({ error: 'Institution not found' });
      return res.status(200).json(institution);
    }

    if (req.method === 'PATCH') {
      const data = req.body;
      const updatedInstitution = await updateInstitution(id, data);
      return res.status(200).json(updatedInstitution);
    }

      if (req.method === 'DELETE') {
      await deleteInstitution(id);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
