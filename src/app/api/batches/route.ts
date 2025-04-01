import { NextRequest} from 'next/server';
import { BatchController } from '@/controllers/batchController';

const batchController = new BatchController();

export async function GET(req: NextRequest) {
  return batchController.getAllBatches(req);
}

export async function POST(req: NextRequest) {
  return batchController.createBatch(req);
}