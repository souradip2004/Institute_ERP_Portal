import prisma from '@/config/prisma';
import { studentQueue } from '@/bullmq/queues/student';
export class StudentService {
  async getAllStudents() {
    return prisma.student.findMany({
      include: {
        user: true,
      },
    });
  }

  async createStudent(data: any) {
    console.log('hello from student service');
    console.log(data);
    data.studentRoll=data.rollNumber;
    data.enrollmentStatus="ACTIVE";
    const create=await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: "STUDENT",
        institutionId: data.institutionId,
      },
    }).then((data)=>{return data}).catch((e)=>{console.log(e)});
    if(create)alert('User created successfully');
    const user=await prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    }).then((data)=>{return data}).catch((e)=>{console.log(e)});
    if(!user){
      throw new Error('User not found');
    }
    data.user={}
    data.user.connect={id:user.id}
    const department=await prisma.department.findUnique({
      where: {
        id: "cm906nlv80001xz1rn3azh8zr",
      },
    }).then((data)=>{return data}).catch((e)=>{console.log(e)});
    if(!department){
      throw new Error('Department not found');
    }

    console.log(department);
    data.department={}
    data.department.connect={id:department.id}
    const batch=await prisma.batch.findUnique({
      where: {
        id: "cm90crb30000bxzrfna5zdl0u",
      },
    }).then((data)=>{return data}).catch((e)=>{console.log(e)});
    if(!batch){
      throw new Error('Batch not found');
    }

    data.batch={}
    data.batch.connect={id:batch.id}
    
    console.log(data)

    delete data.rollNumber;
    delete data.userId;
    
    return prisma.student.create({
      data
    });
  }

  async getStudentById(id: string) {
    return prisma.student.findUnique({ where: { id }, include: {
        user: true,
      }, });
  }

  async updateStudent(id: string, data: any) {
    return studentQueue.add('update-student', {
      data,
      identity: id,
    });
  }

  async deleteStudent(id: string) {
    return studentQueue.add('delete-student', {
      identity: id,
    });
  }

  async getStudentsByBatchId(batchId: string) {
    return prisma.student.findMany({
      where: { batchId },
      include: {
        user: true,
      },
    });
  }

  async getStudentsByDeptId(departmentId: string) {
    return prisma.student.findMany({
      where: { departmentId },
      include: {
        user: true,
      },
    });
  }
}
