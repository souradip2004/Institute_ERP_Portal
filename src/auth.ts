// auth.ts or [...nextauth]/route.ts
import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/services/emailService";
import crypto from "crypto";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Github,
    Google,
    // Credential provider for email login
    Credentials({
      id: "credentials-email",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Email authorize called", { credentials });

        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            student: true,
            teacher: true,
          },
        });

        if (!user || !user.password) {
          console.log("User not found or password not set");
          throw new Error("Invalid credentials");
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          console.log("Password invalid");
          throw new Error("Invalid credentials");
        }

        console.log("Email login successful", { userId: user.id });

        // Return user object with all needed data
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          emailVerified: user.emailVerified || new Date(), // Allow login even if not verified
          studentId: user.student?.id || null,
          teacherId: user.teacher?.id || null,
        };
      },
    }),
    // Credential provider for username login
    Credentials({
      id: "credentials-username",
      name: "Username",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Username authorize called", { credentials });

        if (!credentials?.username || !credentials?.password) {
          console.log("Missing username or password");
          throw new Error("Username and password are required");
        }

        // Find user by username
        const user = await prisma.user.findFirst({
          where: { username: credentials.username },
          include: {
            student: true,
            teacher: true,
          },
        });

        if (!user || !user.password) {
          console.log("User not found or password not set");
          throw new Error("Invalid credentials");
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          console.log("Password invalid");
          throw new Error("Invalid credentials");
        }

        console.log("Username login successful", { userId: user.id });

        // Return user object with all needed data
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          emailVerified: user.emailVerified || new Date(), // Allow login even if not verified
          studentId: user.student?.id || null,
          teacherId: user.teacher?.id || null,
        };
      },
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.SMTP_FROM_EMAIL,
      async sendVerificationRequest({ identifier: email, url, token }) {
        await sendVerificationEmail(email, token);
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("signIn callback", {
        providerType: account?.provider,
        userId: user?.id,
      });

      // Skip verification for credential-based login
      if (
        account?.provider === "credentials-email" ||
        account?.provider === "credentials-username"
      ) {
        return true;
      }

      // For email verification provider, still use verification flow
      if (account?.provider === "email" && !user.emailVerified) {
        // Generate verification token only if emailVerified is null
        if (user.emailVerified === null) {
          const token = await prisma.verificationToken.create({
            data: {
              identifier: user.email!,
              token: crypto.randomUUID(),
              expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            },
          });

          await sendVerificationEmail(user.email!, token.token);
        }

        return "/verify-request"; // Redirect to verification request page
      }

      // For OAuth providers, allow without email verification
      return true;
    },

    async jwt({ token, user }) {
      // Include additional user information in the token when signing in
      if (user) {
        console.log("JWT callback with user", { userId: user.id });
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
        token.username = user.username;
        token.studentId = user.studentId;
        token.teacherId = user.teacherId;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.username = token.username as string | null;
        session.user.studentId = token.studentId as string | null;
        session.user.teacherId = token.teacherId as string | null;
      }

      return session;
    },
  },
  events: {
    signOut: async () => {
      // Clear localStorage on signout
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("session");
      }
    },
  },
});
