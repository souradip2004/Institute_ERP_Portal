import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NoteController.getNotesByTeacher(req, {
    params: { teacherId: params.id },
  });
}
