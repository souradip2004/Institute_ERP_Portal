import prisma from "@/config/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { parseSetCookie } from "next/dist/compiled/@edge-runtime/cookies";

//#TODO: Move to env file
const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "default_refresh_secret";

export enum Role {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
  STUDENT = "STUDENT",
}

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    role: Role;
    institutionId: string;
  }) {
    console.log("hi service registration");
    const { email, password, role, institutionId } = data;

    // Validate role
    if (!Object.values(Role).includes(role)) {
      throw new Error(
        `Invalid role. Allowed values: ${Object.values(Role).join(", ")}`
      );
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        email,
        passwordHash: passwordHash,
        role,
        institutionId,
        isActive: true,
      },
    });
  }

  async login(data: { email: string; password: string }) {
    const { email, password } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new Error("Invalid credentials");
    }

    // User stays logged in for 14 days
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "14d",
    });

    // Update user last login time
    const _user = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      token,
      id: _user.id,
      email: _user.email,
      role: _user.role,
      institutionId: _user.institutionId,
      createdAt: _user.createdAt,
      updatedAt: _user.updatedAt,
      lastLogin: _user.lastLogin,
    };
  }

  async logout() {
    return new Response(null, {
      status: 200,
      headers: { "Set-Cookie": "token=; HttpOnly; Path=/; Max-Age=0" },
    });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const resetToken = uuidv4();
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpires: new Date(Date.now() + 3600000) }, // 1 hour expiration
    });

    console.log(`Reset token: ${resetToken}`); // Replace with actual email sending logic
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
    });

    if (!user) throw new Error("Invalid or expired token");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) throw new Error("Invalid token");

      return jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
        expiresIn: "1d",
      });
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}
