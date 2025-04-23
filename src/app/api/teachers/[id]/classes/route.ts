import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = params.id;

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    console.log(`Fetching classes for teacher ID: ${teacherId}`);

    // 1. Get classes where the teacher is directly assigned as the primary teacher
    const primaryClasses = await prisma.classSection.findMany({
      where: {
        teacherId: teacherId
      },
      select: {
        id: true,
        sectionName: true,
        batch: {
          select: {
            batchName: true
          }
        },
        semester: {
          select: {
            name: true
          }
        },
        maxStudents: true,
        studentEnrollments: {
          select: {
            id: true
          }
        }
      }
    });

    // 2. Get recent assignments for the teacher
    const recentAssignments = await prisma.assignment.findMany({
      where: {
        createdById: teacherId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        classSectionId: true,
        createdAt: true
      }
    });

    // 3. Get upcoming exams for the teacher
    const upcomingExams = await prisma.exam.findMany({
      where: {
        createdById: teacherId,
        examDate: {
          gte: new Date()
        }
      },
      orderBy: {
        examDate: 'asc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        examDate: true,
        classSectionId: true
      }
    });

    // 4. Format the response
    const formattedClasses = [];

    // Add primary classes
    for (const cls of primaryClasses) {
      // Find recent assignment for this class
      const classAssignment = recentAssignments.find(a => a.classSectionId === cls.id);
      // Find upcoming exam for this class
      const classExam = upcomingExams.find(e => e.classSectionId === cls.id);
      
      formattedClasses.push({
        id: cls.id,
        className: cls.batch?.batchName ? `Class ${cls.batch.batchName}` : 'Class',
        sectionName: cls.sectionName || '',
        subject: 'Class Teacher',
        studentCount: cls.studentEnrollments?.length || 0,
        maxStudents: cls.maxStudents || 30,
        attendancePercentage: Math.floor(Math.random() * 20) + 80, // Placeholder
        semester: cls.semester?.name || '',
        lastAssignment: classAssignment ? {
          title: classAssignment.title,
          daysAgo: Math.floor((new Date().getTime() - new Date(classAssignment.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        } : {
          title: 'No recent assignments',
          daysAgo: 0
        },
        nextExam: classExam ? {
          date: new Date(classExam.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          day: `(${new Date(classExam.examDate).toLocaleDateString('en-US', { weekday: 'long' })})`
        } : {
          date: 'No scheduled exams',
          day: ''
        }
      });
    }

    // If no classes found and during development, provide fallback data
    if (formattedClasses.length === 0 && process.env.NODE_ENV === 'development') {
      console.log('No classes found, returning fallback data for development');
      
      return NextResponse.json([
        {
          id: 'class1',
          className: 'Class 9th',
          sectionName: 'A',
          subject: 'Mathematics',
          studentCount: 35,
          attendancePercentage: 78,
          lastAssignment: {
            title: "Algebra Set 3",
            daysAgo: 1
          },
          nextExam: {
            date: "Apr 12",
            day: "(Monday)"
          }
        },
        {
          id: 'class2',
          className: 'Class 10th',
          sectionName: 'B',
          subject: 'Physics',
          studentCount: 38,
          attendancePercentage: 82,
          lastAssignment: {
            title: "Newton's Laws",
            daysAgo: 2
          },
          nextExam: {
            date: "Apr 15",
            day: "(Thursday)"
          }
        }
      ]);
    }

    // Return the formatted classes
    return NextResponse.json(formattedClasses);
  } catch (error) {
    console.error('Error in teacher classes API route:', error);
    
    // Return fallback data in development mode to avoid breaking the UI
    if (process.env.NODE_ENV === 'development') {
      console.log('Error occurred, returning fallback data for development');
      return NextResponse.json([
        {
          id: 'class1',
          className: 'Class 9th',
          sectionName: 'A',
          subject: 'Mathematics',
          studentCount: 35,
          attendancePercentage: 78,
          lastAssignment: {
            title: "Algebra Set 3",
            daysAgo: 1
          },
          nextExam: {
            date: "Apr 12",
            day: "(Monday)"
          }
        }
      ]);
    }
    
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
