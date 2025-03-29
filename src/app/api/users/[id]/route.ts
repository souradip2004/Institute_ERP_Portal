import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/controllers/userController';

const userController = new UserController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return userController.getUserById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return userController.updateUser(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return userController.deleteUser(params.id);
}
