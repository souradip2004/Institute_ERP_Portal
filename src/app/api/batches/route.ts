import { NextRequest, NextResponse } from 'next/server';
import { BatchController } from '@/controllers/batchController';

const batchController = new BatchController();

export async function GET(req: NextRequest) {
  return await batchController.getAllBatches(req);
}

export async function POST(req: NextRequest) {
  return await batchController.createBatch(req);
}
