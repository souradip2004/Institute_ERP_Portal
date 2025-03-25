import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
// The data type of the request body
/*
 id                  String           @id @default(uuid()) @db.Uuid
  userId              String           @unique @map("user_id") @db.Uuid
  studentId           String           @unique @map("student_id") // Roll number/registration, now unique
  firstName           String           @map("first_name")
  lastName            String           @map("last_name")
  gender              String?
  dateOfBirth         DateTime?        @map("date_of_birth") @db.Date
  address             String?
  phone               String?
  parentGuardianName  String?          @map("parent_guardian_name")
  parentGuardianPhone String?          @map("parent_guardian_phone")
  parentGuardianEmail String?          @map("parent_guardian_email")
  departmentId        String           @map("department_id") @db.Uuid
  batchId             String           @map("batch_id") @db.Uuid
  createdAt           DateTime         @default(now()) @map("created_at")
  updatedAt           DateTime         @updatedAt @map("updated_at")
  currentSemester     Int?             @map("current_semester")
  currentYear         Int?             @map("current_year")
  enrollmentStatus    EnrollmentStatus @map("enrollment_status")
  */
 /*
   id               String                @id @default(uuid()) @db.Uuid
  studentId        String                @map("student_id") @db.Uuid
  classSectionId   String                @map("class_section_id") @db.Uuid
  createdAt        DateTime              @default(now()) @map("created_at")
  updatedAt        DateTime              @updatedAt @map("updated_at")
  enrollmentStatus ClassEnrollmentStatus @map("enrollment_status")
 */
type enrollment={
    studentId:string;
    classSectionId:string;
    createdAt:Date;
    updatedAt:Date;
    enrollmentStatus:"enrolled"|"dropped"|"completed";
}
type Student={
    userId: string;
    studentId: string;
    firstName: string;
    lastName: string
    gender:string;
    dateOfBirth:Date;
    address:string;
    phone:string;
    parentGuardianName:string;
    parentGuardianPhone:string;
    parentGuardianEmail:string;
    departmentId:string;
    batchId:string;
    createdAt:Date;
    updatedAt:Date;
    currentSemester:number;
    currentYear:number;
    enrollmentStatus:"active"|"suspended"|"withdrawn"|"graduated";
};
export default async function handler(req:NextApiRequest,res:NextApiResponse){

    let d:Student[]=req.body.students;
    let classId:string=req.body.classId;
    let studentRecord: string[] = [];
    if(req.method!=="POST")
        return res.status(405).json({error:"Method not allowed"});
    try{
        d.forEach(async(student:Student)=>{
        let student1=await prisma.student.create({
            data:student
        });
        studentRecord.push(student1.userId);
        let enroll:enrollment={
            studentId:student1.userId,
            classSectionId:classId,
            createdAt:new Date(),
            updatedAt:new Date(),
            enrollmentStatus:"enrolled"
        }
        await prisma.studentClassEnrollment.create({
            data:enroll
        });
    })
        return res.status(201).json({message:"Student created successfully",userId:studentRecord});
    }catch(e){
        console.log(e);
        return res.status(500).json({error:"Internal Server Error"});
    }
}