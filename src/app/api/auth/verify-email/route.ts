// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_token", req.url)
    );
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    if (!verificationToken?.identifier) {
      return NextResponse.redirect(
        new URL("/login?error=expired_token", req.url)
      );
    }

    // To delete token need both to find  @@unique [identifier ,token]
    await prisma.verificationToken.delete({
      where: {
        identifier_token: { identifier: verificationToken.identifier, token },
      },
    });
    return NextResponse.redirect(
      new URL("/login?error=expired_token", req.url)
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: verificationToken.identifier },
      data: {
        emailVerified: new Date(), // Set the current timestamp
      },
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: { identifier: verificationToken.identifier, token },
      },
    }),
  ]);

  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}
