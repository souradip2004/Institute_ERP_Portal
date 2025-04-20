import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { attachmentId: string } }
) {
  return NoteController.deleteAttachment(req, {
    params: { id: params.attachmentId },
  });
}
