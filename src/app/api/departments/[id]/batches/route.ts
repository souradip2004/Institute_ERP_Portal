import { NextRequest, NextResponse } from "next/server";
import { BatchController } from "@/controllers/batchController";

const batchController = new BatchController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const batches = await batchController.getBatchesByDepartment(id);
        return NextResponse.json(batches, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
