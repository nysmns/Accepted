import { NextResponse } from 'next/server';
import { generateJSON } from '@/lib/ai';
import { quotaBlock, recordUsage, releaseUsage } from '@/lib/quota';
import { getSessionUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  const user = await getSessionUser(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const stats = body?.stats;
  if (!stats || typeof stats !== 'object' || JSON.stringify(stats).length > 8_000) {
    return NextResponse.json({ error: 'stats are required' }, { status: 400 });
  }

  let usageId: number | null = null;
  try {
    const block = await quotaBlock(user.id, 'ai');
    if (block) return NextResponse.json({ error: block.message }, { status: block.status });
    usageId = await recordUsage(user.id, 'ai');

    const result = await generateJSON<{ summary: string; strengths: string[]; focusAreas: string[]; actions: string[] }>(
      `Review this applicant's practice record from Accepted!. Every score came from earlier evaluations (50 is typical, 75 is strong, 90+ is rare).

Practice record: ${JSON.stringify(stats)}

Tie every point to the data. Do not give a pep talk.

Return JSON only, in exactly this shape:
{"summary":"three sentences: where they are and the one pattern behind most scores","strengths":["at most 3 short points"],"focusAreas":["at most 3 short points on where marks are lost"],"actions":["exactly three concrete actions for next week, highest impact first"]}`,
      600
    );
    if (typeof result.summary !== 'string' || !Array.isArray(result.actions)) {
      throw new Error('The breakdown was not in the expected format.');
    }
    return NextResponse.json({
      summary: result.summary.slice(0, 800),
      strengths: (result.strengths ?? []).filter((s) => typeof s === 'string').slice(0, 3),
      focusAreas: (result.focusAreas ?? []).filter((s) => typeof s === 'string').slice(0, 3),
      actions: result.actions.filter((s) => typeof s === 'string').slice(0, 3),
    });
  } catch (e) {
    await releaseUsage(usageId).catch(() => undefined);
    console.error('Summary failed:', e);
    return NextResponse.json({ error: 'Could not generate the breakdown. Try again.' }, { status: 500 });
  }
}
