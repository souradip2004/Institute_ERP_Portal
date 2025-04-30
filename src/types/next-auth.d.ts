import { DefaultSession, DafaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DafaultUser {
    role?: string;
    emailVerified?: Date | null;
    username?: string | null;
    studentId?: string | null;
    teacherId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      emailVerified?: Date | null;
      username?: string | null;
      studentId?: string | null;
      teacherId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    emailVerified?: Date | null;
  }
}
