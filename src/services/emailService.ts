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
  const subject = "Welcome to Ai Classroom!";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding:20px; background:#f9f9f9; color:#333;">
      <div style="max-width:600px; margin:auto; background:#ffffff; padding:32px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.06);">
        
        <h1 style="margin:0 0 12px; color:#4f46e5;">Welcome to <span style="color:#111827;">Ai Classroom</span>!</h1>
        
        <p style="font-size:16px; line-height:1.5; margin:0 0 24px;">
          Thank you for signing up—we’re thrilled to have you on board. Your account has been created successfully.
        </p>

        <a href="https://commercial.aiclassroom.in/login"
           style="display:inline-block; background:#4f46e5; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:16px;">
          Log in & explore
        </a>

        <p style="font-size:15px; line-height:1.5; margin:32px 0 0;">
          Have questions? Just hit reply or email us at 
          <a href="mailto:support@aiclassroom.in" style="color:#4f46e5; text-decoration:none;">support@aiclassroom.in</a>.
        </p>

        <hr style="border:none; border-top:1px solid #e5e7eb; margin:40px 0 24px;" />

        <p style="font-size:12px; color:#6b7280; text-align:center;">
          &copy; ${new Date().getFullYear()} Ai Classroom. All rights reserved.
        </p>
      </div>
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

export async function sendUserDetails(to: string,password:string) {
  const subject = "Welcome to Our Service!";
  const htmlContent =  `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h1 style="color: #4f46e5;">Welcome to <span style="color: #111827;">Ai Classroom</span>!</h1>
        <p style="font-size: 16px;">Thank you for signing up. Below are your account details:</p>

        <table style="width: 100%; margin-top: 20px; font-size: 16px;">
          <tr>
            <td style="font-weight: bold; padding: 8px 0;">Email ID:</td>
            <td style="color: #4b5563;">${to}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px 0;">Password:</td>
            <td style="color: #4b5563;">${password}</td>
          </tr>
        </table>

        <p style="margin-top: 30px;">You can now log in and start exploring the features of Ai Classroom.</p>
        <a href="https://commercial.aiclassroom.in/login" style="display: inline-block; margin-top: 20px; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Login Now</a>

        <p style="margin-top: 40px; font-size: 14px; color: #6b7280;">
          If you have any questions, feel free to <a href="mailto:support@aiclassroom.in" style="color: #4f46e5;">contact our support team</a>.
        </p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} Ai Classroom. All rights reserved.</p>
      </div>
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
