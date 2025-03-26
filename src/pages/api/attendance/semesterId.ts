import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
/*
  id            String   @id @default(uuid()) @db.Uuid
  name          String
  startDate     DateTime @map("start_date") @db.Date
  endDate       DateTime @map("end_date") @db.Date
  institutionId String   @map("institution_id") @db.Uuid
  isCurrent     Boolean  @map("is_current")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
*/
type Semester={
    name:string;
    startDate:Date;
    endDate:Date;
    institutionId:string;
    isCurrent:boolean;
    createdAt:Date;
    updatedAt:Date;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    try {
        const semester: Semester = {
            ...req.body,
            isCurrent: req.body.isCurrent === 'true',
        };
        const semesterid=await prisma.semester.findFirst({
            where:{
                name:semester.name
            }
        });
        if (semesterid) {
            return res.status(404).json({ error: 'Semester already exists',id: semesterid.id });
        }
        const newSemester = await prisma.semester.create({
            data: semester,
            
        });
        return res.status(201).json({ message: 'Semester created successfully', id: newSemester.id });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
//curl -X POST http://localhost:3000/api/attendance/semester -H "Content-Type: application/json" -d '{"name":"Spring 2022","startDate":"2022-01-01","endDate":"2022-05-01","institutionId":"1","isCurrent":true}'