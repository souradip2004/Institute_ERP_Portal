import { NextRequest, NextResponse } from 'next/server';
import { MotherClassService } from '@/services/motherClassService';

const motherClassService = new MotherClassService();

export class MotherClassEnrollmentController {
  async getAllEnrollments(req: NextRequest) {
    try {
      const enrollments = await motherClassService.getAllEnrollments();
      return NextResponse.json(enrollments);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching enrollments:', error.message);
      } else {
        console.error('Error fetching enrollments:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching enrollments' }, { status: 500 });
    }
  }

  async createEnrollment(req: NextRequest) {
    try {
      const data = await req.json();
      const createClass=await motherClassService.createEnrollment(data)
       return NextResponse.json(createClass)
    }catch(error){
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while creating enrollments' }, { status: 500 });
    }

}
    async updateClass(id:string,req:NextRequest){
      try{
        const data=await req.json();
        console.log(data)
        const updateClass=await motherClassService.addEnrollment(id,data);
        return NextResponse.json(updateClass)
      }catch(error){
        return NextResponse.json({error:error instanceof Error?error.message:"An error occured while updating endpoints "},{status:500})
      }
    }
    async getClassById(id:string){
      try{
        const getClass=await motherClassService.getMotherClassById(id)
        return NextResponse.json(getClass)
      }catch(error){
        return NextResponse.json({error:error instanceof Error?error.message:"An error occured while fetching motherclass by id"},{status:500})
      }
    }
    async getClassByInstitution(id:string){
      try{
        const getclass=await motherClassService.getMotherClassByInstitution(id);
        return NextResponse.json(getclass)
      }catch(error){
        return NextResponse.json({error:error instanceof Error?error.message:"An error occured while fetching motherclass by id"},{status:500})
      }
    }
}
