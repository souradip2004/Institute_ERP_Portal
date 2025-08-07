import {NextResponse} from 'next/server';
import {PrismaClient, Student, User} from '@prisma/client';

const prisma = new PrismaClient();

// Define a more detailed type for our final student structure
export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const motherClassId = searchParams.get('motherClassId');

    if (!motherClassId) {
      return NextResponse.json(
        {error: 'motherClassId is required!'},
        {status: 400}
      );
    }

    const classLocalFees = await prisma.localFees.findMany({
      where: {
        classFees: {
          some: {
            motherClassId: motherClassId
          }
        }
      },
      include: {
        classFees: {
          select: {
            dueDate: true,
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // --- 2. Fetch the MotherClass with its enrolled students and their *existing* fee links ---
    const motherClassWithStudents = await prisma.motherClass.findUnique({
      where: {id: motherClassId},
      select: {
        institutionId: true,
        sectionName: true,
        classSections: {
          select: {
            studentEnrollments: {
              select: {
                student: {
                  include: {
                    user: {select: {name: true, email: true}},
                    localFees: {
                      select: {
                        localFeesId: true,
                        id: true,
                        offsetFee: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!motherClassWithStudents) {
      return NextResponse.json({error: 'Class not found!'}, {status: 404});
    }

    // --- 3. Process the data to build the final, structured response ---
    const studentEnrollments =
      motherClassWithStudents.classSections[0]?.studentEnrollments || [];

    const processedStudents = studentEnrollments.map((enrollment) => {
      const student = enrollment.student;

      // Create a lookup map for the student's existing fees for O(1) access time
      const studentFeeLinkMap = new Map(
        student.localFees.map((feeLink) => [
          feeLink.localFeesId,
          {id: feeLink.id, offsetFee: feeLink.offsetFee},
        ])
      );

      // For each student, generate their specific fee statuses by referencing the main class fees list
      const feeStatuses = classLocalFees.map((classFee) => {
        const studentLink = studentFeeLinkMap.get(classFee.id);
        return {
          localFeeId: classFee.id, // ID of the fee in the top-level array
          localFeesOnStudentId: studentLink?.id || null, // The join table record ID, or null
          offsetFee: studentLink?.offsetFee ?? null, // The specific offset, or null
        };
      });

      return {
        id: student.id,
        studentRoll: student.studentRoll,
        enrollmentStatus: student.enrollmentStatus,
        user: student.user,
        feeLinks: feeStatuses, // The new, lean array
      };
    });

    // --- 4. Assemble the final response object ---
    return NextResponse.json(
      {
        institute: motherClassWithStudents.institutionId,
        section: motherClassWithStudents.sectionName,
        localFees: classLocalFees, // The single, top-level array of fee details
        studentEnrollments: processedStudents, // The array of students with their specific fee links
      },
      {status: 200}
    );

  } catch
    (e) {
    console.error(e); // Log the actual error on the server
    return NextResponse.json(
      {error: 'Internal server error. Please try again later.'},
      {status: 500}
    );
  } finally {
    await prisma.$disconnect();
  }
}