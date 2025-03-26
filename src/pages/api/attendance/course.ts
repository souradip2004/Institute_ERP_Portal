import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
/*
 id           String     @id @default(uuid()) @db.Uuid
  courseCode   String     @unique @map("course_code")
  name         String
  description  String?
  creditHours  Int        @map("credit_hours")
  courseType   CourseType @map("course_type")
  departmentId String     @map("department_id") @db.Uuid
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  createdById  String     @map("created_by") @db.Uuid
*/
type Course={
    courseCode:string;
    name:string;
    description:string;
    creditHours:number;
    courseType:"core"|"elective";
    departmentId:string;
    createdAt:Date;
    updatedAt:Date;
    createdById:string;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    try {
        const course: Course = {...req.body,creditHours:parseInt(req.body.creditHours, 10)};
        const courseid=await prisma.course.findFirst({
            where:{
                courseCode:course.courseCode
            }
        });
        if (courseid) {
            return res.status(404).json({ error: 'Course already exists',id: courseid.id });
        }
        const newCourse = await prisma.course.create({
            data: course,
            
        });
        return res.status(201).json({ message: 'Course created successfully', id: newCourse.id });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
//curl -X POST http://localhost:3000/api/attendance/course -H "Content-Type: application/json" -d '{"courseCode":"CSE101","name":"Introduction to Computer Science","description":"Introduction to Computer Science","creditHours":3,"courseType":"core","departmentId":"1","createdById":"1"}'