import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
/*
  id           String   @id @default(uuid()) @db.Uuid
  batchName    String   @map("batch_name")
  year         Int
  departmentId String   @map("department_id") @db.Uuid
  maxStudents  Int      @map("max_students")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
*/
type Batch={
    batchName:string;
    year:number;
    departmentId:string;
    maxStudents:number;
    createdAt:Date;
    updatedAt:Date;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    try {
        const batch:Batch = req.body;
        const batchid=await prisma.batch.findFirst({
            where:{
                batchName:batch.batchName
            }
        });
        if (batchid) {
            return res.status(404).json({ error: 'Batch already exists',id: batchid.id });
        }
        const newBatch = await prisma.batch.create({
            data: batch,
            
        });
        return res.status(201).json({ message: 'Batch created successfully', id: newBatch.id });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}