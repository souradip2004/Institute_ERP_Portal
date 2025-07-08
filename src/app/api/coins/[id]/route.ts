import { NextRequest, NextResponse } from 'next/server';
import { creditController } from '@/controllers/creditController';

const examSubmissionController = new creditController();

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Corrected line: Await context.params before destructuring
  const { id } = await context.params; // <--- This is the fix!

  const coinsParam = req.nextUrl.searchParams.get('coins');
  console.log(coinsParam, id);

  return examSubmissionController.updatecoins(id, coinsParam ? parseInt(coinsParam, 10) : 0);
}