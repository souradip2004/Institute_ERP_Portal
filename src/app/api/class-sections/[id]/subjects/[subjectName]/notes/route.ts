import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; subjectName: string } }
) {
  return NoteController.getNotesBySubject(req, {
    params: { classSectionId: params.id, subjectName: params.subjectName },
  });
}
