import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  return NoteController.getNotesByTeacher(req, {
    params: { teacherId: id },
  });
}
