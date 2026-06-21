import { NextRequest } from "next/server";
import { NoteController } from "@/controllers/noteController";

export async function DELETE(req: NextRequest, props: { params: Promise<{ attachmentId: string }> }) {
  const params = await props.params;
  return NoteController.deleteAttachment(req, {
    params: { id: params.attachmentId },
  });
}
