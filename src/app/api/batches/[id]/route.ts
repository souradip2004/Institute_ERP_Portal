import { NextRequest} from 'next/server';
import { BatchController } from '@/controllers/batchController';

const batchController = new BatchController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return batchController.getBatchById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return batchController.updateBatch(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return batchController.deleteBatch(params.id);
}