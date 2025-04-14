import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

const userService = new UserService();

export class UserController {
  async getAll(req: NextRequest) {
    try {
      const users = await userService.getAll();
      return NextResponse.json(users);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async create(req: NextRequest) {
    try {
      const data = await req.json();
      console.log('Creating user with data:', data);
      const user = await userService.create(data);
      console.log('User created:', user);
      return NextResponse.json(user,{ status: 201 });
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getById(id: string) {
    try {
      const user = await userService.getById(id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async update(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const user = await userService.update(id, data);
      return NextResponse.json(user);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async delete(id: string) {
    try {
      await userService.delete(id);
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
