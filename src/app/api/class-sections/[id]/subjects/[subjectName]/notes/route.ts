import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string; subjectName: string }> }
) {
  const params = await props.params;
  return NoteController.getNotesBySubject(req, {
    params: { classSectionId: params.id, subjectName: params.subjectName },
  });
}
