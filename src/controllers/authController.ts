// src/controllers/authController.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';

const authService = new AuthService();

export class AuthController {
  async register(req: NextRequest) {
    try {
      console.log('hi controller registered');
      const body = await req.json();
      const user = await authService.register(body);
      return NextResponse.json({ message: 'User registered successfully', user }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async login(req: NextRequest) {
    try {
      const body = await req.json();
      const { token, user } = await authService.login(body);
      return NextResponse.json({ message: 'Login successful', token, user }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async logout() {
    try {
      authService.logout();
      return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async forgotPassword(req: NextRequest) {
    try {
      const body = await req.json();
      await authService.forgotPassword(body.email);
      return NextResponse.json({ message: 'Password reset link sent' }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async resetPassword(req: NextRequest) {
    try {
      const body = await req.json();
      await authService.resetPassword(body.token, body.newPassword);
      return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async refreshToken(req: NextRequest) {
    try {
      const body = await req.json();
      const newToken = await authService.refreshToken(body.refreshToken);
      return NextResponse.json({ token: newToken }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
