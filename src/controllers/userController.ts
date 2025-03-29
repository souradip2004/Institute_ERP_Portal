import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

const userService = new UserService();

export class UserController {
  async getAllUsers(req: NextRequest) {
    try {
      const users = await userService.getAllUsers();
      return NextResponse.json(users);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async createUser(req: NextRequest) {
    try {
      const data = await req.json();
      const user = await userService.createUser(data);
      return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getUserById(id: string) {
    try {
      const user = await userService.getUserById(id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateUser(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const user = await userService.updateUser(id, data);
      return NextResponse.json(user);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async deleteUser(id: string) {
    try {
      await userService.deleteUser(id);
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
