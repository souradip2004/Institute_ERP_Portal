import {NextResponse} from 'next/server';
import {Prisma, PaymentStatus} from '@prisma/client';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      classFeeId,
      studentId,
      amount,
      paymentDate,
      paymentMethod,
      transactionId,
      status,
    } = body;

    if (!classFeeId || !studentId || !amount || !paymentDate || !paymentMethod || !status) {
      return NextResponse.json({error: 'Missing required fields'}, {status: 400});
    }

    if (!Object.values(PaymentStatus).includes(status)) {
      return NextResponse.json({error: `Invalid status. Must be one of: ${Object.values(PaymentStatus).join(', ')}`}, {status: 400});
    }

    const newFeesCollection = await prisma.feesCollection.create({
      data: {
        classFeeId,
        studentId,
        amount,
        paymentDate: new Date(paymentDate),
        paymentMethod,
        transactionId,
        status,
      },
    });

    return NextResponse.json(newFeesCollection, {status: 201});

  } catch (error) {
    console.error('Error creating fees collection:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          {error: 'Failed to create record. Ensure the `studentId` and `classFeeId` exist.'},
          {status: 400}
        );
      }
    }

    return NextResponse.json({error: 'An internal server error occurred.'}, {status: 500});
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classFeeId = searchParams.get('classFeeId');
    const studentId = searchParams.get('studentId');

    const where: Prisma.FeesCollectionWhereInput = {};

    if (classFeeId) {
      where.classFeeId = classFeeId;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    const feesCollections = await prisma.feesCollection.findMany({
      where
    });

    return NextResponse.json(feesCollections, { status: 200 });
  } catch (error) {
    console.error('Error fetching fees collections:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
