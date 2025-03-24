// src/pages/api/auth/logout.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear the token (if using cookies, clear it)
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
  return res.status(200).json({ message: 'Logout successful' });
}
