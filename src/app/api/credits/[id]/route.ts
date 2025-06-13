import { NextRequest, NextResponse } from 'next/server';
import { creditController } from '@/controllers/creditController';
const transaction=new creditController()
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try{
      const { id } = context.params;

      if(!id){
        return NextResponse.json({error:"ID is Missing"},{status:500});
      }
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || '', 10);
    const year = parseInt(searchParams.get('year') || '', 10);
    console.log(month)

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json({ error: "Month and year are required as query parameters" }, { status: 400 });
    }
    const data = await transaction.getById(id, month, year);
    return data;
  }
  catch (error) {
    console.log(error)
    return NextResponse.json({error:error},{status:404})
  }
}

export async function POST(req:NextRequest,context:{params:{id:string}}){
  try{
       const { id } = context.params;
      const data1 = await req.json();
      if(!id){
        return NextResponse.json({error:"ID is Missing"},{status:500});
      }
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || '', 10);
    const year = parseInt(searchParams.get('year') || '', 10);
    console.log(month)

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json({ error: "Month and year are required as query parameters" }, { status: 400 });
    }
    const data = await transaction.updateTotalById(id, data1,month, year);
    return data;
  }
  catch (error) {
    console.log(error)
    return NextResponse.json({error:error},{status:404})
  }
}