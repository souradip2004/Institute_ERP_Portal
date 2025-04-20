// src/lib/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1d' });
};

export const verifyAuth = async (token: string): Promise<{ id: string } | null> => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    if (!decoded || !decoded.userId) {
      return null;
    }
    return { id: decoded.userId };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};
