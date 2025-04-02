import { NextRequest, NextResponse } from 'next/server';
import { BatchService, CreateBatchDTO, UpdateBatchDTO, BatchFilter } from '@/services/batchService';

const batchService = new BatchService();

export class BatchController {
  async getAllBatches(req: NextRequest) {
    try {
      const url = new URL(req.url);
      const departmentId = url.searchParams.get('departmentId') || undefined;
      const filters: BatchFilter = { departmentId };

      const batches = await batchService.getAllBatches(filters);
      return NextResponse.json(batches);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching batches:', error.message);
      } else {
        console.error('Error fetching batches:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching batches' }, { status: 500 });
    }
  }

  async createBatch(req: NextRequest) {
    try {
      const data = await req.json();
      const { batchName, year, departmentId, maxStudents } = data;

      if (!departmentId) {
        return NextResponse.json({ error: 'departmentId is required' }, { status: 400 });
      }

      const createData: CreateBatchDTO = { batchName, year, departmentId, maxStudents };
      const batch = await batchService.createBatch(createData);
      return NextResponse.json(batch, { status: 201 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating batch:', error.message);
      } else {
        console.error('Error creating batch:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while creating the batch' }, { status: 500 });
    }
  }

  async getBatchById(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });

      const batch = await batchService.getBatchById(id);
      if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 });

      return NextResponse.json(batch);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error fetching batch ${id}:`, error.message);
      } else {
        console.error(`Error fetching batch ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching the batch' }, { status: 500 });
    }
  }

  async updateBatch(id: string, req: NextRequest) {
    try {
      if (!id) return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });

      const data = await req.json();
      const updateData: UpdateBatchDTO = {
        batchName: data.batchName,
        year: data.year,
        maxStudents: data.maxStudents,
      };

      const updatedBatch = await batchService.updateBatch(id, updateData);
      return NextResponse.json(updatedBatch);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error updating batch ${id}:`, error.message);
      } else {
        console.error(`Error updating batch ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while updating the batch' }, { status: 500 });
    }
  }

  async deleteBatch(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });

      await batchService.deleteBatch(id);
      return NextResponse.json({ message: 'Batch deleted successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error deleting batch ${id}:`, error.message);
      } else {
        console.error(`Error deleting batch ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while deleting the batch' }, { status: 500 });
    }
  }

    async getBatchesByDepartment(departmentId: string) {
        return batchService.fetchBatchesByDepartment(departmentId);
    }
}