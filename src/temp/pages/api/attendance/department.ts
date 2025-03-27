import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';
import { UUID } from "crypto";
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
        const department:Department = req.body;
        const departmentid=await prisma.department.findFirst({
            where:{
                name:department.name
            }
        });
        if (departmentid) {
            return res.status(404).json({ error: 'Department already exists',id: departmentid.id });
        }
        const newDepartment = await prisma.department.create({
            data: department,
            
        });
        return res.status(201).json({ message: 'Department created successfully', departmentId: newDepartment.id });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
//curl -X POST http://localhost:3000/api/attendance/department -H "Content-Type: application/json" -d '{"name":"CSE","code":"CSE","description":"Computer Science and Engineering","institutionId":"1"}'