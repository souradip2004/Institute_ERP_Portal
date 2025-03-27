import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";

/*
  id          String   @id @default(uuid()) @db.Uuid
  sectionName String   @map("section_name")
  batchId     String   @map("batch_id") @db.Uuid
  courseId    String   @map("course_id") @db.Uuid
  semesterId  String   @map("semester_id") @db.Uuid
  teacherId   String   @map("teacher_id") @db.Uuid
  maxStudents Int      @map("max_students")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
    */
type ClassSection={
    sectionName:string;
    batchId:string;
    courseId:string;
    semesterId:string;
    teacherId:string;
    maxStudents:number;
    createdAt:Date;
    updatedAt:Date;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    try {
        const classSection:ClassSection = {...req.body,maxStudents:parseInt(req.body.maxStudents, 10)};
        const classSectionid=await prisma.classSection.findFirst({
            where:{
                sectionName:classSection.sectionName
            }
        });
        if (classSectionid) {
            return res.status(404).json({ error: 'Class Section already exists',id: classSectionid.id });
        }
        const newClassSection = await prisma.classSection.create({
            data: classSection,
            
        });
        return res.status(201).json({ message: 'Class Section created successfully', classSectionId: newClassSection.id });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
//curl -X POST http://localhost:3000/api/attendance/classSection -H "Content-Type: application/json" -d '{"sectionName":"A","batchId":"1","courseId":"1","semesterId":"1","teacherId":"1","maxStudents":50}'