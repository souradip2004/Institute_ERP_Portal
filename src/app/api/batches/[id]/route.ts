import { NextRequest} from 'next/server';
import { BatchController } from '@/controllers/batchController';

const batchController = new BatchController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return batchController.getBatchById(params.id);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return batchController.updateBatch(params.id, req);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return batchController.deleteBatch(params.id);
}