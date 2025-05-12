// src/services/emailService.ts
"use server"
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

export async function sendVerificationEmail(to: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  const subject = "Verify Your Email Address";
  const htmlContent = `
    <h1>Verify Your Email Address</h1>
    <p>Thank you , for choosing us.</p>
    <p>Please click the link below to verify your email. This link will expire in 1 hour.</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
    <p>${verificationUrl}</p>
  `;
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}
export async function sendWelcomeEmail(to: string) {
  const subject = "Welcome to Our Service!";
  const htmlContent = `
    <h1>Welcome to Ai Classroom </h1>
    <p>Thank you for signing up. We are excited to have you on board!</p>
    <p>If you have any questions, feel free to reach out.</p>
  `;
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}
export async function sendOtpEmail(to: string, otp: string) {
  const subject = "Your OTP Code";
  const htmlContent = `
    <h1>Your OTP Code</h1>
    <p>Your OTP code is: <strong>${otp}</strong></p>
    <p>This code will expire in 5 minutes.</p>
  `;
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to,
    subject,
    html: htmlContent,
  };

  transporter.sendMail(mailOptions);
}
export async function sendMassEmail(
  to: string[],
  subject: string,
  content: string
) {
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to: to.join(","),
    subject,
    html: content,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const subject = "Reset your password";
  const htmlContent = `
    <h1>Reset Your Password</h1>
    <p>You requested a password reset for your account.</p>
    <p>Please click the link below to reset your password. This link will expire in 1 hour.</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
    <p>${resetUrl}</p>
  `;

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);


}
