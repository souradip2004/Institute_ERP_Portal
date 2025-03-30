// src/services/emailService.ts
import nodemailer from 'nodemailer';

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
  
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to,
    subject: 'Verify Your Email Address',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendMassEmail(to: string[], subject: string, content: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to: to.join(','),
    subject,
    html: content,
  };

  await transporter.sendMail(mailOptions);
}