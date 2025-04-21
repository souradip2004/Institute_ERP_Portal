import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateTeacherCourseSectionInput {
  teacherId: string;
  courseId: string;
  classSectionId: string;
  semesterId: string;
  days: number[]; // Array of day numbers (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  startTime: string; // e.g., "09:00:00"
  endTime: string; // e.g., "10:30:00"
  adminId: string; // Added to validate institute
}

async function getInstituteId(adminId: string): Promise<string> {
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { role: true, instituteId: true },
  });

  if (!admin) {
    throw new Error('Admin not found');
  }
  if (admin.role !== 'ADMIN') {
    throw new Error('User is not an admin');
  }
  if (!admin.instituteId) {
    throw new Error('Institute ID not found for admin');
  }

  return admin.instituteId;
}

export async function createTeacherCourseSectionAndSessions({
  teacherId,
  courseId,
  classSectionId,
  semesterId,
  days,
  startTime,
  endTime,
  adminId,
}: CreateTeacherCourseSectionInput) {
  try {
    // Validate inputs
    if (!teacherId || !courseId || !classSectionId || !semesterId || !days.length || !startTime || !endTime || !adminId) {
      throw new Error('All fields are required');
    }

    // Get institute ID
    const instituteId = await getInstituteId(adminId);

    // Verify teacher, course, class section, and semester exist and belong to the institute
    const [teacher, course, classSection, semester] = await Promise.all([
      prisma.teacher.findUnique({
        where: { id: teacherId },
        include: { department: true },
      }),
      prisma.course.findUnique({
        where: { id: courseId },
        include: { department: true },
      }),
      prisma.classSection.findUnique({
        where: { id: classSectionId },
        include: { teacher: { include: { department: true } } },
      }),
      prisma.semester.findUnique({ where: { id: semesterId } }),
    ]);

    if (!teacher || teacher.department.instituteId !== instituteId) {
      throw new Error('Teacher not found or does not belong to the institute');
    }
    if (!course || course.department.instituteId !== instituteId) {
      throw new Error('Course not found or does not belong to the institute');
    }
    if (!classSection || classSection.teacher?.department.instituteId !== instituteId) {
      throw new Error('Class section not found or assigned teacher does not belong to the institute');
    }
    if (!semester) {
      throw new Error('Semester not found');
    }

    // Check if semester is still active
    const today = new Date();
    if (new Date(semester.endDate) < today) {
      throw new Error('Semester has ended');
    }

    // Create TeacherCourseSectionRelation
    const relation = await prisma.teacherCourseSectionRelation.create({
      data: {
        teacherId,
        courseId,
        classSectionId,
        semesterId,
      },
    });

    // Generate AttendanceSession records
    const sessions = [];
    let currentDate = new Date(today);
    const endDate = new Date(semester.endDate);

    while (currentDate <= endDate) {
      if (days.includes(currentDate.getDay())) {
        const sessionDate = new Date(currentDate);
        const sessionStart = new Date(`${sessionDate.toISOString().split('T')[0]}T${startTime}`);
        const sessionEnd = new Date(`${sessionDate.toISOString().split('T')[0]}T${endTime}`);

        sessions.push({
          classSectionId,
          courseId,
          teacherId,
          sessionDate,
          startTime: sessionStart,
          endTime: sessionEnd,
          sessionType: 'LECTURE', // Adjust as needed
          status: 'SCHEDULED',
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Bulk create sessions
    await prisma.attendanceSession.createMany({
      data: sessions,
    });

    return { relation, sessionCount: sessions.length };
  } catch (error: any) {
    console.error('Error creating teacher course section relation and sessions:', error);
    throw error instanceof Error ? error : new Error('Unknown error');
  }
}

export async function getTeachers(adminId: string) {
  const instituteId = await getInstituteId(adminId);

  const departments = await prisma.department.findMany({
    where: { instituteId },
    select: { id: true },
  });

  const departmentIds = departments.map((dept) => dept.id);

  return prisma.teacher.findMany({
    where: {
      departmentId: { in: departmentIds },
    },
    select: {
      id: true,
      user: { select: { name: true } },
      teacherCode: true,
    },
  });
}

export async function getCourses(adminId: string) {
  const instituteId = await getInstituteId(adminId);

  const departments = await prisma.department.findMany({
    where: { instituteId },
    select: { id: true },
  });

  const departmentIds = departments.map((dept) => dept.id);

  return prisma.course.findMany({
    where: {
      departmentId: { in: departmentIds },
    },
    select: {
      id: true,
      name: true,
      courseCode: true,
    },
  });
}

export async function getClassSections(adminId: string) {
  const instituteId = await getInstituteId(adminId);

  const departments = await prisma.department.findMany({
    where: { instituteId },
    select: { id: true },
  });

  const departmentIds = departments.map((dept) => dept.id);

  const teachers = await prisma.teacher.findMany({
    where: { departmentId: { in: departmentIds } },
    select: { id: true },
  });

  const teacherIds = teachers.map((teacher) => teacher.id);

  return prisma.classSection.findMany({
    where: {
      teacherId: { in: teacherIds },
    },
    select: {
      id: true,
      sectionName: true,
      batch: { select: { batchName: true } },
      semester: { select: { name: true } },
    },
  });
}