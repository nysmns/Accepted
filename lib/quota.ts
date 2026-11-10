import { getSupabaseAdmin } from '@/lib/supabase/server';

// Per student, per Toronto calendar day. One AI review = a scored answer, interview review, EC rating or breakdown.
// Budget: about 1.5k tokens per review, so 200 reviews a day is roughly 300k tokens. Tune with env vars.
const USER_AI_DAILY = Number(process.env.AI_USER_DAILY || 6);
const USER_STT_DAILY = Number(process.env.STT_USER_DAILY || 12);
const GLOBAL_AI_DAILY = Number(process.env.AI_DAILY_CAP || 200);

export type Kind = 'ai' | 'stt';
export type Block = { status: number; message: string };

function startOfTorontoDay(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const sinceMidnightMs = ((n('hour') % 24) * 3600 + n('minute') * 60 + n('second')) * 1000;
  return new Date(Date.now() - sinceMidnightMs).toISOString();
}

async function aiUsed(userId: string | null, since: string): Promise<number> {
  const db = getSupabaseAdmin();
  let jobs = db.from('feedback_jobs').select('id', { count: 'exact', head: true }).neq('status', 'failed').gte('created_at', since);
  let rows = db.from('summary_usage').select('id', { count: 'exact', head: true }).eq('kind', 'ai').gte('created_at', since);
  if (userId) {
    jobs = jobs.eq('user_id', userId);
    rows = rows.eq('user_id', userId);
  }
  const [a, b] = await Promise.all([jobs, rows]);
  if (a.error || b.error) throw new Error('Could not read usage.');
  return (a.count ?? 0) + (b.count ?? 0);
}

/** Returns why the student must stop, or null when they still have quota today. */
export async function quotaBlock(userId: string, kind: Kind): Promise<Block | null> {
  const since = startOfTorontoDay();
  if (kind === 'stt') {
    const { count, error } = await getSupabaseAdmin()
      .from('summary_usage').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('kind', 'stt').gte('created_at', since);
    if (error) throw new Error('Could not read usage.');
    return (count ?? 0) >= USER_STT_DAILY
      ? { status: 429, message: `You have used all ${USER_STT_DAILY} voice transcriptions for today. The limit resets at midnight Eastern. Type your answer or come back tomorrow.` }
      : null;
  }
  if ((await aiUsed(userId, since)) >= USER_AI_DAILY) {
    return { status: 429, message: `You have used all ${USER_AI_DAILY} AI reviews for today. The limit resets at midnight Eastern. Come back tomorrow.` };
  }
  if ((await aiUsed(null, since)) >= GLOBAL_AI_DAILY) {
    return { status: 503, message: 'Nova has hit the free daily capacity for everyone. Come back tomorrow.' };
  }
  return null;
}

/** Records one use. Written answers are counted from feedback_jobs instead, so they do not call this. */
export async function recordUsage(userId: string, kind: Kind): Promise<number> {
  const { data, error } = await getSupabaseAdmin().from('summary_usage').insert({ user_id: userId, kind }).select('id').single();
  if (error || !data) throw new Error('Could not record usage.');
  return data.id as number;
}

/** Gives the use back when our side failed, so a student is never charged for an error. */
export async function releaseUsage(id: number | null) {
  if (id === null) return;
  await getSupabaseAdmin().from('summary_usage').delete().eq('id', id);
}
