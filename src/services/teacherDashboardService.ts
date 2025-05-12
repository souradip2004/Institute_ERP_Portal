import prisma from '@/lib/prisma';

export class TeacherDashboardService {

  async getAssignmentsByTeacherId(teacherId: string) {
    try {
      if (!teacherId || typeof teacherId !== "string") {
        throw new Error("Invalid teacherId");
      }

      const assignments = await prisma.assignment.findMany({
        where: {
          createdById: teacherId,
        },
        select: {
          id: true,
          title: true,
          classSection: {
            select: {
              id: true,
              sectionName: true,
              batch: {
                select: {
                  batchName: true,
                },
              },
              semester: {
                select: {
                  name: true,
                },
              },
            },
          },
          dueDate: true,
          status: true,
          submissions: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5, // Limit to most recent 5 for dashboard
      });

      // Format the data specifically for the UI needs
      return assignments.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        class: `${assignment.classSection.batch?.batchName || ''} ${assignment.classSection.sectionName || ''}`.trim(),
        subject: assignment.classSection.semester?.name || 'General',
        dueDate: assignment.dueDate ? assignment.dueDate.toISOString().split('T')[0] : '',
        submissions: `${assignment._count.submissions}/${assignment.submissions.length || 0}`,
        status: assignment.status || 'Active'
      }));
    } catch (error) {
      console.error("Error fetching assignments by teacherId:", error);
      throw error instanceof Error ? error : new Error("Unknown error");
    }
  }

  async getExamsByTeacherId(teacherId: string) {
    try {
      if (!teacherId || typeof teacherId !== "string") {
        throw new Error("Invalid teacherId");
      }

      const exams = await prisma.exam.findMany({
        where: {
          createdById: teacherId,
          examDate: {
            gte: new Date(), // Only upcoming exams
          },
          status: {
            not: 'COMPLETED'
          }
        },
        select: {
          id: true,
          title: true,
          examDate: true,
          status: true,
          classSection: {
            select: {
              id: true,
              sectionName: true,
              batch: {
                select: {
                  batchName: true,
                },
              },
              semester: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          examDate: 'asc',
        },
        take: 5, // Limit to most recent 5 for dashboard
      });

      // Format the data specifically for the UI needs
      return exams.map(exam => ({
        id: exam.id,
        title: exam.title,
        class: `${exam.classSection.batch?.batchName || ''} ${exam.classSection.sectionName || ''}`.trim(),
        subject: exam.classSection.semester?.name || 'General',
        date: exam.examDate ? exam.examDate.toISOString().split('T')[0] : '',
        status: exam.status === 'IN_PROGRESS' ? 'Upcoming' : exam.status
      }));
    } catch (error) {
      console.error("Error fetching exams by teacherId:", error);
      throw error instanceof Error ? error : new Error("Unknown error");
    }
  }

  async getDashboardData(teacherId: string) {
    try {
      const [assignments, exams] = await Promise.all([
        this.getAssignmentsByTeacherId(teacherId),
        this.getExamsByTeacherId(teacherId)
      ]);

      return {
        assignments,
        exams
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error instanceof Error ? error : new Error("Unknown error");
    }
  }
}