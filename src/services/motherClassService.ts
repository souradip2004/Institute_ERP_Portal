import prisma from "@/lib/prisma";



export class MotherClassService {
  async getAllEnrollments() {
    return prisma.motherClass.findMany({
      include:{
        classSections:true
      }
    });
  }
async getMotherClassByInstitution(id:string){
  return prisma.motherClass.findMany({
    where:{
      institutionId:id
    },
    include:{
      classSections:true
    }
  })
}
  async createEnrollment(data:any){
    return prisma.motherClass.create({
      data: {
        sectionName:data.sectionName,
        institutionId:data.institution
      },
    });
  }

async addEnrollment(id: string, data: any) {
  try {
    console.log("id ",id)
    console.log("Raw incoming data:", data);
    let bata= data.classSections.map((sectionId: string) => ({ id: sectionId }));
 console.log(bata)
    return await prisma.motherClass.update({
      where: { id },
      data: {
        classSections: {
          connect: bata,
        },
      },
    });
  } catch (err) {
    console.error("🔥 Error in addEnrollment:", err);
    throw err; // rethrow after logging
  }
}


async getMotherClassById(id:string){
   return prisma.motherClass.findFirst({
   where:{
   id},
   include:{
   classSections:true,
   }
   })
}
 
}
