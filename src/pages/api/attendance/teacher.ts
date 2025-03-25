import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";

// The data type of the request body
/*  id                 String           @id @default(uuid()) @db.Uuid
userId             String           @unique @map("user_id") @db.Uuid
teacherId          String           @unique @map("teacher_id") // Teacher ID now unique
firstName          String           @map("first_name")
lastName           String           @map("last_name")
gender             String?
dateOfBirth        DateTime?        @map("date_of_birth") @db.Date
address            String?
phone              String?
qualification      String?
joiningDate        DateTime?        @map("joining_date") @db.Date
employmentStatus   EmploymentStatus @map("employment_status")
departmentId       String           @map("department_id") @db.Uuid
createdAt          DateTime         @default(now()) @map("created_at")
updatedAt          DateTime         @updatedAt @map("updated_at")
performanceScore   Float?           @map("performance_score")
lastEvaluationDate DateTime?        @map("last_evaluation_date") @db.Date
*/
type Data = {
    userId: string;
    teacherId: string;
    firstName: string;
    lastName: string;
    employmentStatus: "fullTime" | "partTime" | "contract" | "guest";
    createdAt: Date;
    updatedAt: Date;
    gender: "male" | "female" | "other";
    dateOfBirth: Date;
    address: string;
    phone: string;
    qualification: string;
    joiningDate: Date;
    departmentId: string;
    performanceScore: number;
    lastEvaluationDate: Date;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 let d: Data = req.body;
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
try{
let teacher = await prisma.teacher.create({
   data:d })
   return res.status(201).json({ message: 'Teacher created successfully', userId: teacher.id });
}catch(e){
    console.log(e);
    return res.status(500).json({ error: 'Internal Server Error' });
}   
}