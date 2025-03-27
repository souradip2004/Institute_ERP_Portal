import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
import { hashPassword } from '@/lib/auth';
const generatePassword = (): string => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
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
/*
  id                String    @id @default(uuid()) @db.Uuid
  email             String    @unique
  passwordHash      String    @map("password_hash")
  role              Role      @default(STUDENT)
  isActive          Boolean   @map("is_active")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  lastLogin         DateTime? @map("last_login")
  resetToken        String?   @map("reset_token")
  resetTokenExpires DateTime? @map("reset_token_expires")
  isEmailVerified   Boolean   @default(false) @map("is_email_verified")
  twoFactorSecret   String?   @map("two_factor_secret")
  twoFactorEnabled  Boolean   @default(false) @map("two_factor_enabled")
  profileImageUrl   String?   @map("profile_image_url")
  timezone          String?
  institutionId     String    @map("institution_id") @db.Uuid
  */
type user={
    email:string;
    passwordHash:string;
    role:"STUDENT" | "TEACHER" | "ADMIN";
    isActive:boolean;
    createdAt:Date;
    updatedAt:Date;
    lastLogin:Date;
    resetToken:string;
    resetTokenExpires:Date;
    isEmailVerified:boolean;
    twoFactorSecret:string;
    twoFactorEnabled:boolean;
    profileImageUrl:string;
    timezone:string;
    institutionId:string;
}
type enrollment={
    studentId:string;
    classSectionId:string;
    createdAt:Date;
    updatedAt:Date;
    enrollmentStatus:"enrolled"|"dropped"|"completed";
}
type inputType={
    email:string;
    firstName:string;
    lastName:string;
    gender:string;
    dateOfBirth:Date;
    address:string;
    phone:string;
    parentGuardianName:string;
    parentGuardianPhone:string;
    parentGuardianEmail:string;
    departmentId:string;    
    batchId:string;
    currentSemester:number;
    currentYear:number;
    enrollmentStatus:"active"|"suspended"|"withdrawn"|"graduated";
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
    let e:inputType[]=req.body.students;
    let classId:string=req.body.classId;
    let studentRecord: { userId: string, studentId: string,email:string,password:string}[] = [];
    if(req.method!=="POST")
        return res.status(405).json({error:"Method not allowed"});
    try{
        for (const student of e) {
            let password=generatePassword();
            let hashedPassword: string = await hashPassword(password);
        let user:user={
            email:student.email,
            passwordHash:hashedPassword,
            role:"STUDENT",
            isActive:true,
            createdAt:new Date(),
            updatedAt:new Date(),
            lastLogin:new Date(),
            resetToken:"",
            resetTokenExpires:new Date(),
            isEmailVerified:true,
            twoFactorSecret:"",
            twoFactorEnabled:false,
            profileImageUrl:"",
            timezone:"",
            institutionId:""
        }
        let user1=await prisma.user.findFirst({
            where:{
                email:student.email
            }
        });
        
        if (user1) continue;
        let user2=await prisma.user.create({
            data:user
        });
        let student1:Student={
            userId:user2.id,
            studentId:student.email,
            firstName:student.firstName,
            lastName:student.lastName,
            gender:student.gender,
            dateOfBirth:student.dateOfBirth,
            address:student.address,
            phone:student.phone,
            parentGuardianName:student.parentGuardianName,
            parentGuardianPhone:student.parentGuardianPhone,
            parentGuardianEmail:student.parentGuardianEmail,
            departmentId:student.departmentId,
            batchId:student.batchId,
            createdAt:new Date(),
            updatedAt:new Date(),
            currentSemester:student.currentSemester,
            currentYear:student.currentYear,
            enrollmentStatus:student.enrollmentStatus
        }
        let student2=await prisma.student.findFirst({
            where:{
                studentId:student.email
            }
        });
        if (student2) continue;
        studentRecord.push({ userId: student1.userId, studentId: student1.studentId,email:student.email,password:password });
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
    }
        return res.status(201).json({message:"Student created successfully",userId:studentRecord});
    }catch(e){
        console.log(e);
        return res.status(500).json({error:"Internal Server Error"});
    }
}
// curl -X POST http://localhost:3000/api/attendance/students \
// -H "Content-Type: application/json" \
// -d '{
//   "classId": "example-class-id",
//   "students": [
//     {
//       "email": "student1@example.com",
//       "firstName": "John",
//       "lastName": "Doe",
//       "gender": "Male",
//       "dateOfBirth": "2000-01-01",
//       "address": "123 Main St",
//       "phone": "1234567890",
//       "parentGuardianName": "Jane Doe",
//       "parentGuardianPhone": "0987654321",
//       "parentGuardianEmail": "jane.doe@example.com",
//       "departmentId": "example-department-id",
//       "batchId": "example-batch-id",
//       "currentSemester": 1,
//       "currentYear": 2023,
//       "enrollmentStatus": "active"
//     }
//   ]
// }'