import { AuthController } from "@/controllers/authController";

const authController = new AuthController();

export const POST = async () => {
  return authController.logout();
};
