import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Student } from '@prisma/client'; // Assuming Student model might be needed for validation

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const institutionId = searchParams.get('institutionId');

    // 1. Validate all required parameters
    if (!studentId || !institutionId) {
      return NextResponse.json({
        error: "Missing required parameters. 'studentId' and 'institutionId' are required."
      }, { status: 400 });
    }

    // 2. Security Check: Verify the student exists and belongs to the institution
    // This query ensures we don't leak student data across institutions.
    // NOTE: This assumes Student -> Department -> institutionId relationship exists.
    // If your schema is different, adjust the `department` include accordingly.
    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
        department: {
          institutionId: institutionId,
        }
      },
      select: { id: true }
    });

    if (!student) {
      return NextResponse.json({
        error: "Student not found in the specified institution."
      }, { status: 404 });
    }

    // 3. Find all MotherClass IDs for the student's active enrollments
    const enrollments = await prisma.studentClassEnrollment.findMany({
      where: {
        studentId: studentId,
        enrollmentStatus: 'ENROLLED',
        classSection: {
          motherClassId: {
            not: null
          }
        }
      },
      select: {
        classSection: {
          select: {
            motherClassId: true
          }
        }
      }
    });

    const studentMotherClassIds = enrollments
    .map(e => e.classSection.motherClassId)
    .filter((id): id is string => id !== null);

    if (studentMotherClassIds.length === 0) {

      return NextResponse.json([], { status: 200 });
    }

    const feeDetails = await prisma.classFee.findMany({
      where: {
        // Filter for fees related to the student's classes
        motherClassId: {
          in: studentMotherClassIds,
        },
        // Ensure we are only fetching Local Fees
        localFeesId: {
          not: null,
        },
        // And that the local fee has been explicitly assigned to this student
        localFees: {
          studentsLocalFees: {
            some: {
              studentId: studentId,
            },
          },
        },
      },
      include: {
        // Include the full details of the local fee
        localFees: true,
        // Include the collection records, but ONLY for the specified student
        feesCollections: {
          where: {
            studentId: studentId,
          },
        },
      },
    });

    // 5. Transform the data into a structured, user-friendly response
    const structuredResponse = feeDetails
    .filter(detail => detail.localFees) // Ensure localFees is not null
    .map(detail => {
      // The 'feesCollections' array will have at most one item due to the where clause
      const collectionDetails = detail.feesCollections[0] || null;

      return {
        localFeesId: detail.localFees!.id,
        name: detail.localFees!.name,
        description: detail.localFees!.description,
        amountDue: detail.localFees!.amount,
        taxPercentage: detail.localFees!.taxPercentage,
        penalty: detail.localFees!.penalty,
        paymentTerms: detail.localFees!.paymentterms,
        classFeeId: detail.id,
        // Student-specific payment information
        paymentStatus: collectionDetails?.status || 'NOT_GENERATED',
        amountPaid: collectionDetails?.amount,
        paymentDate: collectionDetails?.paymentDate,
        paymentMethod: collectionDetails?.paymentMethod,
        transactionId: collectionDetails?.transactionId,
        feesCollectionId: collectionDetails?.id || null
      };
    });

    return NextResponse.json(structuredResponse, { status: 200 });

  } catch (error) {
    console.error("Error fetching student local fee details: ", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}