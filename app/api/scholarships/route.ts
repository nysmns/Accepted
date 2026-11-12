import { NextResponse } from 'next/server';
import type { Scholarship } from '@/lib/scholarships';
import {
  activeScholarships,
  fieldsForGroups,
  matchScholarships,
  recommended,
  type StudentProfile,
} from '@/lib/scholarships';
import { categoriesForEcs } from '@/lib/ec-tags';
import { getSimulatorProgram } from '@/lib/data/prompts';
import { refreshScholarships } from '@/lib/scholarships/repository';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Fresh, merged list (3 Canadian sources + locally curated entries).
 *  Cached for 5 minutes on the server. */
let cachedMerged: { all: Scholarship[]; fetchedAt: string; sourceCount: number } | null = null;

/**
 * Active scholarships only. Signed-in students also get a profile-based
 * ranking built from their saved extracurriculars and their supplemental
 * practice history.
 */
export async function GET(req: Request) {
  const user = await getSessionUser(req.headers.get('authorization'));
  const joined = new URL(req.url).searchParams.get('refresh') === '1';
  const now = Date.now();

  if (!cachedMerged || joined || now - new Date(cachedMerged?.fetchedAt ?? 0).getTime() > 300_000) {
    // Force refresh when the client asks for it, or every 5 minutes otherwise.
    const { all, fetchedAt, sourceCount } = await refreshScholarships();
    cachedMerged = { all, fetchedAt, sourceCount };
  }

  const active = activeScholarships(cachedMerged!.all);

  if (!user) {
    return NextResponse.json({
      scholarships: active,
      recommended: [],
      profile: null,
      basis: null,
      lastVerified: cachedMerged?.fetchedAt ?? new Date().toISOString().slice(0, 10),
      count: active.length,
    });
  }

  const averageParam = new URL(req.url).searchParams.get('average');
  const parsedAverage = Number(averageParam);
  const average =
    averageParam && Number.isFinite(parsedAverage) && parsedAverage >= 50 && parsedAverage <= 100
      ? parsedAverage
      : null;

  const admin = getSupabaseAdmin();
  const [{ data: ecRows, error: ecError }, { data: jobs, error: jobError }] = await Promise.all([
    admin
      .from('student_ecs')
      .select('name, role, detail')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true }),
    admin
      .from('feedback_jobs')
      .select('program_code, program')
      .eq('user_id', user.id)
      .eq('status', 'done')
      .limit(200),
  ]);

  if (ecError || jobError) {
    return NextResponse.json({ error: 'Could not build your profile.' }, { status: 500 });
  }

  const ecCategories = categoriesForEcs(
    (ecRows ?? []).map((e) => ({ name: e.name ?? '', role: e.role ?? '', detail: e.detail ?? '' }))
  );
  const groups = [
    ...new Set(
      (jobs ?? [])
        .map((j) => getSimulatorProgram(j.program_code ?? '')?.group)
        .filter((g): g is string => Boolean(g))
    ),
  ];
  const fields = fieldsForGroups(groups);

  const profile: StudentProfile = { fields, ecCategories, average, region: 'ON' };
  const scored = matchScholarships(active, profile);
  const recs = recommended(scored);

  const basis = [
    'Scholarships are recommended based on the sub application practice you’ve done and your extra curriculars',
    fields.length ? `· practice focus: ${fields.join(', ').toLowerCase()}` : '',
    ecCategories.length ? `· activities: ${ecCategories.slice(0, 4).join(', ').toLowerCase()}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return NextResponse.json({
    scholarships: scored,
    recommended: recs.map((s) => s.id),
    profile,
    basis,
    lastVerified: cachedMerged?.fetchedAt ?? new Date().toISOString().slice(0, 10),
    sourceCount: cachedMerged!.sourceCount,
    fetchedAt: cachedMerged!.fetchedAt,
    count: active.length,
  });
}
