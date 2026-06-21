import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/controllers/userController';

const userController = new UserController();

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    const coinsParam = req.nextUrl.searchParams.get('coins');
    const coins = coinsParam ? parseInt(coinsParam, 10) : 1000;
    return userController.verifybyId(params.id, coins);
}
