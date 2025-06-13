import { NextRequest, NextResponse } from 'next/server';
import { creditController } from '@/controllers/creditController';
const transaction=new creditController()
export async function GET() {
  try{
    const data=await transaction.getall()
    const res=await data.json()
    return NextResponse.json(res)
  }
  catch(error){
    console.log(error)
    return NextResponse.json({error:error},{status:404})
  }
}
