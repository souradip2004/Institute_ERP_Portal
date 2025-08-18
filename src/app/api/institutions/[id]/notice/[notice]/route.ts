import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { notice: string } }) {
  const { notice } = await params;
const id = notice;
console.log("Fetching notice with ID:", id);
  try {
    const notice = await prisma.emailForm.findUnique({
      where: { id },
      include: {
        classSections: true,
      },
    });

    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    return NextResponse.json(notice);
  } catch (error) {
    console.error('Error fetching notice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export async function POST(request: Request, { params }: { params: { notice: string } }) {
  const { notice } = await params;
const id = notice;
  console.log("Updating notice with ID:", id);
    const body = await request.json();
    
  try {
    const updatedNotice = await prisma.emailForm.findUnique({
      where: { id },
      include: {
        classSections: true},
    });
    console.log("Updated Notice:", updatedNotice);
    if (!updatedNotice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }
    const studentIds = await prisma.student.findMany({
        where: {
            classEnrollments: {
                some: {
                    classSectionId: {
                        in: updatedNotice.classSections.map((section: { id: string }) => section.id),
                    },
                },
            },
        },
        select: { userId: true },
    });
  console.log("Student IDs:", studentIds);
  let userEmails=[]
 for (const student of studentIds) {
   const user = await prisma.user.findUnique({
    where: { id: student.userId },
    select: { email: true },
  });
  if (user && user.email) {
    userEmails.push(user.email);
  }
}
console.log("User Emails:", userEmails);
    return NextResponse.json({"emails":userEmails});
  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}