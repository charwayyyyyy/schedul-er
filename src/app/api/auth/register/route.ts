import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const schema = z.object({
      name: z.string().min(1, 'Name is required').max(100),
      email: z.string().email('Invalid email').max(200),
      password: z.string().min(8, 'Password must be at least 8 characters').max(100),
      role: z.enum(['STUDENT', 'TEACHER']),
    });

    const parsed = schema.safeParse({
      name: body?.name,
      email: body?.email,
      password: body?.password,
      role: (body?.role || '').toString().toUpperCase(),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { user: userWithoutPassword, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const message =
      process.env.DATABASE_URL
        ? 'Something went wrong'
        : 'Database is not configured. Set DATABASE_URL to your Supabase Postgres connection string.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
