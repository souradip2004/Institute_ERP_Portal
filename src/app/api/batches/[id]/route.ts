import { NextRequest, NextResponse } from 'next/server';
import { BatchController } from '@/controllers/batchController';

const batchController = new BatchController();

// GET method for fetching a batch by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!params.id) {
    return NextResponse.json({ error: 'Invalid Batch ID' }, { status: 400 });
  }
  // Pass the batchId (params.id) to the controller method
  return await batchController.getBatchById(params.id);
}

// PATCH method for updating a batch by ID
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!params.id) {
    return NextResponse.json({ error: 'Invalid Batch ID' }, { status: 400 });
  }
  // Pass both batchId and the request object to the controller method
  return await batchController.updateBatch(params.id, req);
}

// DELETE method for deleting a batch by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!params.id) {
    return NextResponse.json({ error: 'Invalid Batch ID' }, { status: 400 });
  }
  // Pass the batchId to the controller method
  return await batchController.deleteBatch(params.id);
}
