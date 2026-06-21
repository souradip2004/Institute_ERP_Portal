import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return NoteController.addAttachment(req, { params });
}
