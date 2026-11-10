import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase/server';
import { quotaBlock } from '@/lib/quota';
import { WRITTEN_MAX_WORDS, countWords } from '@/lib/limits';
import { drainQueue } from '@/lib/queue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const maxDuration = 30;

/** Queue an answer for background scoring and return without holding the request open. */
export async function POST(req: Request) {
  const user = await getSessionUser(req.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Sign in to get scored.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  const answer = typeof body?.answer === 'string' ? body.answer.trim() : '';

  if (!question || question.length > 2000 || answer.length < 20 || countWords(answer) > WRITTEN_MAX_WORDS) {
    return NextResponse.json(
      { error: `Include a question and an answer of at most ${WRITTEN_MAX_WORDS} words.` },
      { status: 400 }
    );
  }
  if (
    (body?.format !== undefined && body.format !== 'written' && body.format !== 'video') ||
    (body?.programCode !== undefined && typeof body.programCode !== 'string') ||
    (body?.program !== undefined && typeof body.program !== 'string') ||
    (body?.university !== undefined && typeof body.university !== 'string') ||
    String(body?.program ?? '').length > 160 ||
    String(body?.university ?? '').length > 120
  ) {
    return NextResponse.json({ error: 'Some application details are invalid.' }, { status: 400 });
  }

  try {
    const block = await quotaBlock(user.id, 'ai');
    if (block) return NextResponse.json({ error: block.message }, { status: block.status });
  } catch (issue) {
    console.error('Could not verify daily quota:', issue);
    return NextResponse.json({ error: 'Could not verify your daily limit. Try again.' }, { status: 503 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('feedback_jobs')
    .insert({
      user_id: user.id,
      program_code: String(body?.programCode ?? ''),
      program: String(body?.program ?? ''),
      university: String(body?.university ?? ''),
      format: String(body?.format ?? 'written'),
      question,
      answer,
      status: 'queued',
    })
    .select('id, created_at')
    .single();

  if (error || !data) {
    console.error('Could not create feedback job:', error);
    return NextResponse.json({ error: 'Could not queue your answer.' }, { status: 500 });
  }

  // Score now (usually 2-6s) so the first status poll already has the result.
  try {
    await drainQueue();
  } catch (issue) {
    console.error('Feedback queue drain failed:', issue);
  }

  return NextResponse.json({ id: data.id, queued: null }, { status: 202 });
}
