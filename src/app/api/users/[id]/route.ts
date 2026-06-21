import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/controllers/userController';

const userController = new UserController();

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return userController.getById(params.id);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return userController.update(params.id, req);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return userController.delete(params.id);
}
