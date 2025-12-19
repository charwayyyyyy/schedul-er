import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
  school: z.string().max(200).optional(),
  profileClass: z.string().max(200).optional(),
  bio: z.string().max(500).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = process.env.DATABASE_URL || '';
  if (!url || url.includes('YOUR_SUPABASE_HOST') || url.includes('YOUR_SUPABASE_PASSWORD'))
    return NextResponse.json({
      profile: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: '',
        school: '',
        profileClass: '',
        bio: '',
      },
    });
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  return NextResponse.json({ profile: user });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const url = process.env.DATABASE_URL || '';
  if (!url || url.includes('YOUR_SUPABASE_HOST') || url.includes('YOUR_SUPABASE_PASSWORD'))
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  const updated = await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });
  return NextResponse.json({ profile: updated });
}

