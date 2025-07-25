import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const classSectionId = searchParams.get('classSectionId');

    if (!classSectionId) {
      return NextResponse.json({error: "classSectionId is required!"}, {status: 400});
    }

    const studentDetails = await prisma.classSection.findUnique({
      where: {
        id: classSectionId
      },
      select: {
        id: true,
        studentEnrollments: {
          select: {
            student: {
              select: {
                id: true,
                studentRoll: true,
                enrollmentStatus: true,
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log("studentDetails: ", studentDetails);

    return NextResponse.json(studentDetails, {status: 200});

  } catch (error) {
    console.error(error);

    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}