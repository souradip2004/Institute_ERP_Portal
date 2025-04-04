import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/controllers/userController';

const userController = new UserController();

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { params } = await context;
  return userController.getById(params.id);
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { params } = await context;
  return userController.update(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return userController.delete(params.id);
}
