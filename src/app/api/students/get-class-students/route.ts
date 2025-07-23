import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const motherClassId = searchParams.get('motherClassId') as string;

    const motherClassExists = await prisma.motherClass.findUnique({
      where: {
        id: motherClassId
      },
      include: {
        classSections: {
          select: {
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
        }
      }
    });


    if (!motherClassExists) {
      return NextResponse.json({error: "Class not found!"}, {status: 404});
    }


    return NextResponse.json({
      institute: motherClassExists.institutionId,
      section: motherClassExists.sectionName,
      studentEnrollments: motherClassExists.classSections[0].studentEnrollments
    }, {status: 200});

  } catch (e) {

    return NextResponse.json({error: "Internal server error. Please try again later."}, {status: 500});
  }
}