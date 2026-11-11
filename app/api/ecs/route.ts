import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ECS = 8;

type Ec = {
  name: string;
  role: string;
  duration: string;
  hours: number;
  detail: string;
};

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function parseList(raw: unknown): Ec[] | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_ECS) return null;
  const ecs: Ec[] = raw.map((e) => ({
    name: str(e?.name, 80),
    role: str(e?.role, 80),
    duration: str(e?.duration, 40),
    hours: Math.max(0, Math.min(80, Number(e?.hours) || 0)),
    detail: str(e?.detail, 600),
  }));
  if (ecs.some((e) => !e.name)) return null;
  return ecs;
}

/** The signed-in student's saved activities. */
export async function GET(req: Request) {
  const user = await getSessionUser(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from('student_ecs')
    .select('id, name, role, duration, hours, detail, sort_order, updated_at')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: 'Could not load your activities.' }, { status: 500 });
  return NextResponse.json({ ecs: data ?? [] });
}

/** Replace the signed-in student's activity list. */
export async function PUT(req: Request) {
  const user = await getSessionUser(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const ecs = parseList(body?.ecs);
  if (!ecs) {
    return NextResponse.json(
      { error: `Add between 1 and ${MAX_ECS} activities, and give each one a name.` },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  const { error: deleteError } = await admin.from('student_ecs').delete().eq('user_id', user.id);
  if (deleteError) {
    return NextResponse.json({ error: 'Could not save your activities.' }, { status: 500 });
  }

  const { error: insertError } = await admin.from('student_ecs').insert(
    ecs.map((e, i) => ({ ...e, user_id: user.id, sort_order: i }))
  );
  if (insertError) {
    return NextResponse.json({ error: 'Could not save your activities.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: ecs.length });
}

/** Delete one activity (?id=…) or the whole list. */
export async function DELETE(req: Request) {
  const user = await getSessionUser(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  const admin = getSupabaseAdmin();
  const query = admin.from('student_ecs').delete().eq('user_id', user.id);
  const { error } = id ? await query.eq('id', id) : await query;
  if (error) return NextResponse.json({ error: 'Could not delete that activity.' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
