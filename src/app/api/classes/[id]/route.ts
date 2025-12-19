import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = process.env.DATABASE_URL || '';
  if (!url || url.includes('YOUR_SUPABASE_HOST') || url.includes('YOUR_SUPABASE_PASSWORD'))
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const data: { name?: string; description?: string | null; dayOfWeek?: number; startTime?: Date; endTime?: Date } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.dayOfWeek !== undefined) data.dayOfWeek = parsed.data.dayOfWeek;
  if (parsed.data.startTime !== undefined) data.startTime = new Date(parsed.data.startTime);
  if (parsed.data.endTime !== undefined) data.endTime = new Date(parsed.data.endTime);
  const p = await params;
  const existing = await db.class.findUnique({ where: { id: p.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.user.role !== 'ADMIN' && existing.teacherId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const updated = await db.class.update({ where: { id: p.id }, data });
  return NextResponse.json({ class: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = process.env.DATABASE_URL || '';
  if (!url || url.includes('YOUR_SUPABASE_HOST') || url.includes('YOUR_SUPABASE_PASSWORD'))
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  const p = await params;
  const existing = await db.class.findUnique({ where: { id: p.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.user.role !== 'ADMIN' && existing.teacherId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await db.class.delete({ where: { id: p.id } });
  return NextResponse.json({ ok: true });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.DATABASE_URL || '';
  if (!url || url.includes('YOUR_SUPABASE_HOST') || url.includes('YOUR_SUPABASE_PASSWORD'))
    return NextResponse.json({ class: null });
  const p = await params;
  const one = await db.class.findUnique({ where: { id: p.id } });
  if (!one) return NextResponse.json({ class: null }, { status: 404 });
  return NextResponse.json({ class: one });
}

