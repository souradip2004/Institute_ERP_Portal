import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NoteController.addAttachment(req, { params });
}
