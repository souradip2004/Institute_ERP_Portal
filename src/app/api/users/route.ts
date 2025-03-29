import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/controllers/userController';

const userController = new UserController();

export async function GET(req: NextRequest) {
  return userController.getAllUsers(req);
}

export async function POST(req: NextRequest) {
  return userController.createUser(req);
}
