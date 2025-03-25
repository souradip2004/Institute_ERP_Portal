import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
/*
model Department {
  id            String   @id @default(uuid()) @db.Uuid
  name          String
  code          String
  description   String?
  institutionId String   @map("institution_id") @db.Uuid
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
*/

type Department={
    id:string;
    name:string;
    code:string;
    description:string;
    institutionId:string;
    createdAt:Date;
    updatedAt:Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    try {
        const classid: string = req.body.classId;
        const departmentid=await prisma.department.findFirst({
            where:{
                id:classid
            }
        });
        if (!departmentid) {
            return res.status(404).json({ error: 'Department not found' });
        }
        const teachers = await prisma.teacher.findMany({
            where: {
                departmentId: departmentid.id
            }
        });
        return res.status(200).json(teachers);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}