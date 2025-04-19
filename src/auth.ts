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
    // Standard credentials provider - requires email verification
    Credentials({
      id: "credentials-email",
      name: "Email Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("No user found with this email or password not set");
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
    // Username-based credentials provider - no email verification
    Credentials({
      id: "credentials-username",
      name: "Username Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required");
        }

        // Find user by username (name field)
        const user = await prisma.user.findFirst({
          where: {
            username: credentials.username,
            ...(credentials.role ? { role: credentials.role } : {}),
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Verify password
        const isValid = bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Return user object - bypass email verification
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          // We set emailVerified as current date when using username login
          emailVerified: new Date(),
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
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
  callbacks: {
    async signIn({ user, account }) {
      // For standard email-based credentials, check verification
      if (account?.provider === "credentials-email" && !user.emailVerified) {
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

      // For username-based login or OAuth providers, allow without email verification
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
});
