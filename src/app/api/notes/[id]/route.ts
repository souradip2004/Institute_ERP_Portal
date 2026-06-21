import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return NoteController.getNoteById(req, { params });
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return NoteController.updateNote(req, { params });
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return NoteController.deleteNote(req, { params });
}
