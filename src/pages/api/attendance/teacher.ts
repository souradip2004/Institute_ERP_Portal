import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
import { hashPassword } from '@/lib/auth';

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

type User={
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
type inputType={
    email:string;
    password:string;
    role:"STUDENT" | "TEACHER" | "ADMIN";
    isActive:string;
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
    firstName:string;
    lastName:string;
    employmentStatus:"fullTime" | "partTime" | "contract" | "guest";
    gender:"male" | "female" | "other";
    dateOfBirth:Date;
    address:string;
    phone:string;
    qualification:string;
    joiningDate:Date;
    departmentId:string;
    performanceScore:number;
    lastEvaluationDate:Date;
}

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
    let user:inputType=req.body;
    let hashedPassword:string = await hashPassword(user.password);
 let d: User = {
        email: user.email,
        passwordHash: hashedPassword,
        role: user.role,
        isActive: user.isActive.includes("true") ? true : false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        resetToken: user.resetToken,
        resetTokenExpires: new Date(),
        isEmailVerified: user.isEmailVerified,
        twoFactorSecret: user.twoFactorSecret,
        twoFactorEnabled: user.twoFactorEnabled,
        profileImageUrl: user.profileImageUrl,
        timezone: user.timezone,
        institutionId: user.institutionId
 };
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });

try{
let user1 = await prisma.user.findFirst({
   where:{
       email:d.email
   }
})
if(user1){
    let teacher = await prisma.teacher.findFirst({
        where:{
            userId:user1.id
        }
    });

    if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found',userId: user1.id });
    }
    return res.status(404).json({ error: 'User already exists',userId: user1.id,teacherId:teacher.id });
}
let u = await prisma.user.create({
    data:d
})

let e: Data = {
    userId: u.id,
    teacherId: u.id,
    firstName: user.firstName,
    lastName: user.lastName,
    employmentStatus: user.employmentStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    address: user.address,
    phone: user.phone,
    qualification: user.qualification,
    joiningDate: user.joiningDate,
    departmentId: user.departmentId,
    performanceScore: user.performanceScore,
    lastEvaluationDate: user.lastEvaluationDate
};


let teacher = await prisma.teacher.create({
   data:e })
   return res.status(201).json({ message: 'Teacher created successfully', techerid: teacher.id });
}catch(e){
    console.log(e);
    return res.status(500).json({ error: 'Internal Server Error' });
}   
}
// Example usage with curl:
// curl -X POST http://localhost:3000/api/attendance/teacher -H "Content-Type: application/json" -d '{
//   "email": "teacher@example.com",
//   "password": "password",
//   "role": "TEACHER",
//   "firstName": "John",
//   "lastName": "Doe",
//   "employmentStatus": "fullTime",
//   "gender": "male",
//   "dateOfBirth": "1980-01-01T00:00:00.000Z",
//   "departmentId": "department-id"
//  "isActive": true,
// institutionId: "institution-id"
// }'

