import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, coins: number) {
 
  const subject = "Your Account has been verified";
  const htmlContent = `
   <div style="font-family: Arial, sans-serif; color: #333;">
    <h1 style="color: #4A90E2;">Account Verification Successful</h1>
    <p>Dear User,</p>
    <p>Your account has been successfully verified. You have been awarded <strong>${coins} coins</strong> as a token of appreciation.</p>
    <p>Thank you for being a part of our community!</p>
    <p>Best regards,<br/>AI Classroom</p>
   </div>
  `;
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}
export class UserService {
  async getAll() {
    return prisma.user.findMany();
  }

  async create(data: any) {
    const { password, ...otherData } = data;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // Create user with hashed password

    try {
      return await prisma.user.create({
        data: {
          ...otherData,
          password: hashedPassword,
        },
      });
    } catch (error) {
      console.log("Error creating user:", error);
      throw new Error("Error creating user");
    }
  }

  async getById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
  async verifybyId(id: string,coins:number

  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.isVerified) {
      throw new Error('User is already verified');
    }
if (user.email) {
      sendVerificationEmail(user.email, coins).catch((error) => {
        console.error('Error sending verification email:', error);
      });
    } else {
      console.error('User email is null, cannot send verification email.');
    }
    return prisma.user.update({
      where: { id },
      data: {
        isVerified: true,
        coins: { increment: coins } 
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

}
