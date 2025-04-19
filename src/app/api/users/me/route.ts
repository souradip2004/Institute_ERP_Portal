import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

// Handler for GET /users/me
export async function GET() {
  try {
    // Get current authenticated user from session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user data from database based on email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        teacher: true,
        student: true,
        institution: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive information before returning
    const { password, ...safeUserData } = user;
    return NextResponse.json(safeUserData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handler for PUT /users/me
export async function PUT(req: NextRequest) {
  try {
    // Get current authenticated user from session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const updatedData = await req.json(); // Data to update

    // Prevent updating sensitive or restricted fields
    //   const { id, email: newEmail, password, role, ...allowedUpdates } = updatedData;
    const { id, email: newEmail, ...allowedUpdates } = updatedData;

    // Process date fields if they exist
    let processedUpdates = { ...allowedUpdates };
    const { password } = { ...allowedUpdates };

    if (
      processedUpdates.password &&
      typeof processedUpdates.password === "string"
    ) {
      processedUpdates.password = await bcrypt.hash(password, 10);
    }

    if (
      processedUpdates.dateOfBirth &&
      typeof processedUpdates.dateOfBirth === "string"
    ) {
      processedUpdates.dateOfBirth = new Date(processedUpdates.dateOfBirth);
    }

    console.log(processedUpdates);
    // Update the user in the database based on email
    const updatedUser = await prisma.user.update({
      where: { email },
      data: processedUpdates,
    });

    // Remove sensitive information before returning
    const { password: userPassword, ...safeUserData } = updatedUser;
    return NextResponse.json(safeUserData);
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handler for DELETE /users/me
export async function DELETE() {
  try {
    // Get current authenticated user from session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete user
    const deletedUser = await prisma.user.delete({
      where: { email: session.user.email },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
