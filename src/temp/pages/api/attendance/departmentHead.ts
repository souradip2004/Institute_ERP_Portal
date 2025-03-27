import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
/*
  id              String    @id @default(uuid()) @db.Uuid
  userId          String    @unique @map("user_id") @db.Uuid
  teacherId       String    @unique @map("teacher_id") @db.Uuid
  departmentId    String    @unique @map("department_id") @db.Uuid
  appointmentDate DateTime  @map("appointment_date") @db.Date
  endDate         DateTime? @map("end_date") @db.Date
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  user       User       @relation(fields: [userId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  teacher    Teacher    @relation(fields: [teacherId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  department Department @relation(fields: [departmentId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  @@map("department_heads")
*/

type DepartmentHead={
    userId:string;
    teacherId:string;
    departmentId:string;
    appointmentDate:Date;
    endDate:Date;
    createdAt:Date;
    updatedAt:Date;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    try {
        const departmentHead:DepartmentHead = req.body;
        const departmentHeadid=await prisma.departmentHead.findFirst({
            where:{
                userId:departmentHead.userId
            }
        });
        if (departmentHeadid) {
            return res.status(404).json({ error: 'Department Head already exists',id: departmentHeadid.teacherId });
        }
        const newDepartmentHead = await prisma.departmentHead.create({
            data: departmentHead,
            
        });
        return res.status(201).json({ message: 'Department Head created successfully', id: newDepartmentHead.teacherId });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
//curl -X POST http://localhost:3000/api/attendance/departmentHead -H "Content-Type: application/json" -d "{\"userId\":\"1\",\"teacherId\":\"1\",\"departmentId\":\"1\",\"appointmentDate\":\"2022-01-01\",\"endDate\":\"2022-01-01\"}"