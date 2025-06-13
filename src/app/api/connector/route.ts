import { connectMongo, LinkModel } from '@/lib/mongoclient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await connectMongo();
  const body = await request.json();
  const { id, link } = body;
  
  if (!id || !link) {
    return NextResponse.json({ error: 'Missing id or link' }, { status: 400 });
  }

  try {
    const newLink = await LinkModel.create({ id, link });
    return NextResponse.json(newLink, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  await connectMongo();
  const body = await request.json(); 

  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing id in body' }, { status: 400 });
  }

  const link = await LinkModel.findOne({ id });

  if (!link) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(link);
}
