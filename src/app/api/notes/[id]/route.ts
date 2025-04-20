import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NoteController.getNoteById(req, { params });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NoteController.updateNote(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NoteController.deleteNote(req, { params });
}
