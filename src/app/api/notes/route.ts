import { NextRequest, NextResponse } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function GET(req: NextRequest) {
  return NoteController.searchNotes(req);
}

export async function POST(req: NextRequest) {
  return NoteController.createNote(req);
}
