import { NextRequest, NextResponse } from "next/server";
import { AuthController } from "@/controllers/authController";

const authController = new AuthController();

export const POST = async (req: NextRequest) => {
  return authController.login(req);
};
