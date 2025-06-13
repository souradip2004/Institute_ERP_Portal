import prisma from "@/lib/prisma";

export class CourseSectionController {
  async getById(id: string) {
    console.log(id)
    const b=await prisma.teacherCourseSectionRelation.findMany({
        where:{classSectionId:id},
        include:{
            course:true
        }
    })
    console.log(b)
    return b;
  }}