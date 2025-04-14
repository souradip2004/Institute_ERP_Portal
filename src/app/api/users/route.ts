import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/controllers/userController';

const userController = new UserController();

export async function GET(req: NextRequest) {
  return userController.getAll(req);
}

export async function POST(req: NextRequest) {
  let p=await userController.create(req);
  console.log('user created', p);
  return p;
}

