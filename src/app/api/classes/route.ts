import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = process.env.DATABASE_URL || '';
  if (!url || url.includes('YOUR_SUPABASE_HOST') || url.includes('YOUR_SUPABASE_PASSWORD'))
    return NextResponse.json({ classes: [] });
  const where =
    session.user.role === 'ADMIN'
      ? {}
      : { teacherId: session.user.id };
  try {
    const classes = await db.class.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ classes });
  } catch {
    return NextResponse.json({ classes: [] });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = process.env.DATABASE_URL || '';
  if (!url || url.includes('YOUR_SUPABASE_HOST') || url.includes('YOUR_SUPABASE_PASSWORD'))
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const { name, description, dayOfWeek, startTime, endTime } = parsed.data;
  const created = await db.class.create({
    data: {
      name,
      description,
      dayOfWeek,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      teacherId: session.user.id,
    },
  });
  return NextResponse.json({ class: created }, { status: 201 });
}

