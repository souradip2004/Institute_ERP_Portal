import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: teacherId } = params; // params is already awaited by Next.js
    console.log(`Received teacher ID: ${teacherId}`);

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
        return NextResponse.json([]); // Return empty array as original fallback suggested
      }
      return NextResponse.json([]);
    }

    // --- DEDUPLE CLASS SECTIONS ---
    // Use a Map to store unique class sections by their ID
    const uniqueClassSectionsMap = new Map();
    for (const relation of relations) {
      const sectionId = relation.classSection.id;
      // Store the relation itself, or just the classSection, based on what's most convenient
      // We'll store the relation as it contains course info directly
      if (!uniqueClassSectionsMap.has(sectionId)) {
        uniqueClassSectionsMap.set(sectionId, relation);
      }
    }

    // Convert the Map values back to an array for processing
    const uniqueRelations = Array.from(uniqueClassSectionsMap.values());
    console.log(`Found ${relations.length} relations, deduplicated to ${uniqueRelations.length} unique class sections.`);


    // Structure the response to match the required format
   const structuredData = await Promise.all(
  uniqueRelations.map(async (relation, index) => { // Iterate over uniqueRelations now
    const section = relation.classSection;
    const classSectionId = section.id;
    const studentCount = section.studentEnrollments.length;

    const attendancePercentage = Math.floor(Math.random() * (90 - 70 + 1)) + 70;

    // Fetch assignments specific to this unique classSectionId
    const assignments = await prisma.assignment.findMany({
      where: { classSectionId },
      orderBy: { createdAt: 'desc' }, // Order by creation date to easily get the last one
      take: 1, // Only fetch the last assignment
      include: {
        classSection: false, // Don't include redundant data here
        createdBy: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    const lastAssignment = assignments[0] || null;
    let lastAssignmentData = null;
    if (lastAssignment) {
      const today = new Date();
      const assignmentDate = new Date(lastAssignment.createdAt); // Assuming assignments have a createdAt field
      const diffTime = Math.abs(today.getTime() - assignmentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      lastAssignmentData = {
        title: lastAssignment.title,
        daysAgo: diffDays,
        // You might want to include the actual date string as well
        date: assignmentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
    }


    const exams = [
      { date: "Apr 12", day: "(Monday)" },
      { date: "Apr 15", day: "(Thursday)" },
      { date: "Apr 18", day: "(Sunday)" },
    ];
console.log(section)
    return {
      id: relation.course.id, // This is the course ID, not necessarily unique per section
      className: `Class ${section.batch.batchName}`,
      sectionId: section.id, // This is the unique identifier for the class section
      sectionName: section.sectionName || String.fromCharCode(65 + index), // Use actual section name if available, fallback to letter
      subject: relation.course.name,
      studentCount,
      attendancePercentage,
      lastAssignment: lastAssignmentData, // Use the structured last assignment data
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
          id: 'course-math-dev', // Changed ID to reflect dev data
          className: 'Class 9th',
          sectionId: 'section-A-dev',
          sectionName: 'A',
          subject: 'Mathematics',
          studentCount: 35,
          attendancePercentage: 78,
          lastAssignment: {
            title: "Algebra Set 3",
            daysAgo: 1,
            date: "Jul 4, 2025"
          },
          nextExam: {
            date: "Jul 10", // Updated dates for current context
            day: "(Thursday)"
          }
        },
        {
          id: 'course-physics-dev', // Changed ID to reflect dev data
          className: 'Class 10th',
          sectionId: 'section-B-dev',
          sectionName: 'B',
          subject: 'Physics',
          studentCount: 38,
          attendancePercentage: 82,
          lastAssignment: {
            title: "Newton's Laws",
            daysAgo: 2,
            date: "Jul 3, 2025"
          },
          nextExam: {
            date: "Jul 15", // Updated dates for current context
            day: "(Tuesday)"
          }
        }
      ]);
    }

    return NextResponse.json({ error: 'Failed to fetch course sections' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}