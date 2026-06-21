import {NextRequest, NextResponse} from 'next/server';
import {MotherClassEnrollmentController} from '@/controllers/motherClassController';
import prisma from '@/lib/prisma';

const motherClassController = new MotherClassEnrollmentController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  console.log('motherclass');
  const {id} = params;
  return await motherClassController.getClassById(id);
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  console.log('motherclass post');
  const {id} = params;
  return await motherClassController.updateClass(id, req);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const {id} = params;
    if (!id) {
      return NextResponse.json({error: "id required !"}, {status: 400});
    }

    const deletedMotherClass = await prisma.motherClass.delete({
      where: {
        id
      }
    });

    console.log("Deleted mother class ", deletedMotherClass);

    return NextResponse.json({message: "Successfully deleted !", deletedMotherClass}, {status: 200});

  } catch (error) {
    console.log(error);

    return NextResponse.json({error: "Internal server error !"}, {status: 500});
  }
}