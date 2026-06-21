import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = await params;
  return NoteController.getNotesByTeacher(req, {
    params: { teacherId: id },
  });
}
