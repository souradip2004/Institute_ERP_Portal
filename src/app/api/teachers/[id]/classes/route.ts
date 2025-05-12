import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: teacherId } = await params;
 console.log(`Received teacher ID: ${teacherId}`);
const alldata = await prisma.teacherCourseSectionRelation.findMany();
console.log('All data with all teacher IDs:', alldata);
    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    console.log(`Fetching course sections for teacher ID: ${teacherId}`);

    // Query teacher course section relations
    const relations = await prisma.teacherCourseSectionRelation.findMany({
      where: { teacherId },
      include: {
        course: {
          include: {
            department: true,
            createdBy: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
        classSection: {
          include: {
            batch: true,
            semester: true,
            studentEnrollments: {
              include: {
                student: {
                  include: {
                    user: {
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
        semester: true,
      },
    });

    // If no relations found, return empty array or fallback in development
    if (!relations || relations.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No relations found, returning fallback data for development');
        return NextResponse.json([
        ]);
      }
      return NextResponse.json([]);
    }

    // Structure the response to match the required format
   const structuredData = await Promise.all(
  relations.map(async (relation, index) => {
    const section = relation.classSection;
    const classSectionId = section.id;
    const studentCount = section.studentEnrollments.length;

    const attendancePercentage = Math.floor(Math.random() * (90 - 70 + 1)) + 70;

    const assignments = await prisma.assignment.findMany({
      where: { classSectionId },
      include: {
        classSection: {
          include: {
            batch: true,
            semester: true,
            studentEnrollments: {
              include: {
                student: {
                  include: {
                    user: {
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
        createdBy: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    const exams = [
      { date: "Apr 12", day: "(Monday)" },
      { date: "Apr 15", day: "(Thursday)" },
      { date: "Apr 18", day: "(Sunday)" },
    ];

    return {
      id: relation.course.id,
      className: `Class ${section.batch.batchName}`,
      sectionId: section.id,
      sectionName: String.fromCharCode(65 + index),
      subject: relation.course.name,
      studentCount,
      attendancePercentage,
      lastAssignment: assignments[assignments.length - 1] ?? null,
      nextExam: exams[index % exams.length],
    };
  })
);


    return NextResponse.json(structuredData);
  } catch (error) {
    console.error('Error in teacher course sections API route:', error);

    // Return fallback data in development mode
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

    return NextResponse.json({ error: 'Failed to fetch course sections' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
