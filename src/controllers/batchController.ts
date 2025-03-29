import { NextRequest, NextResponse } from 'next/server';
import { BatchService } from '@/services/batchService';

const batchService = new BatchService();

export class BatchController {
  async getAllBatches(req: NextRequest) {
    try {
      const batches = await batchService.getAllBatches();
      return NextResponse.json(batches);
    } catch (error: any) {
      console.error('Error fetching batches:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async createBatch(req: NextRequest) {
    try {
      const data = await req.json();
      const batch = await batchService.createBatch(data);
      return NextResponse.json(batch, { status: 201 });
    } catch (error: any) {
      console.error('Error creating batch:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async getBatchById(batchId: string) {
    try {
      if (!batchId) {
        return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
      }

      const batch = await batchService.getBatchById(batchId);
      if (!batch) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
      }

      return NextResponse.json(batch);
    } catch (error: any) {
      console.error('Error fetching batch by ID:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async updateBatch(batchId: string, req: NextRequest) {
    try {
      if (!batchId) {
        return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
      }

      const data = await req.json();
      const batch = await batchService.updateBatch(batchId, data);
      return NextResponse.json(batch);
    } catch (error: any) {
      console.error('Error updating batch:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async deleteBatch(batchId: string) {
    try {
      if (!batchId) {
        return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
      }

      await batchService.deleteBatch(batchId);
      return NextResponse.json({ message: 'Batch deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting batch:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}
