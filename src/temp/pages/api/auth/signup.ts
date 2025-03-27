// src/pages/api/auth/signup.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('hii');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, role } = req.body;

  if (!email || !password  || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    console.log('\n\n' + hashedPassword + "\n\n");
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role,
        isActive: true,
        institutionId: 'cc32570c-cfe8-4cba-af1b-bf6492511e16'
      },
    });


    return res.status(201).json({ message: 'User created successfully', userId: newUser.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
