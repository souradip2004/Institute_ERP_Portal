import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/controllers/authController';

const authController = new AuthController();

export const POST = async (req: NextRequest) => {
  console.log(`Incoming request method: POST`);

  try {
    return await authController.register(req);
  } catch (error) {
    console.error('Error in register handler:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
