import { NextResponse } from 'next/server';
import { SCHOLARSHIPS } from '@/lib/data/scholarships';
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

const LAST_VERIFIED = SCHOLARSHIPS.reduce(
  (latest, s) => (s.verified > latest ? s.verified : latest),
  '2000-01-01'
);

/** Fresh, merged list (curated + remote supplement). */
let cachedMerged: { all: typeof SCHOLARSHIPS; fetchedAt: string; remoteCount: number } | null =
  null;

function buildCacheKey() {
  return `${LAST_VERIFIED}|${String(cachedMerged?.fetchedAt)}`;
}

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
    const { all, remote, remoteCount, fetchedAt, error } = await refreshScholarships();
    cachedMerged = { all, fetchedAt, remoteCount };
  }

  const active = activeScholarships(cachedMerged!.all);

  if (!user) {
    return NextResponse.json({
      scholarships: active,
      recommended: [],
      profile: null,
      basis: null,
      lastVerified: LAST_VERIFIED,
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
    lastVerified: LAST_VERIFIED,
    remoteCount: cachedMerged!.remoteCount,
    fetchedAt: cachedMerged!.fetchedAt,
    count: active.length,
  });
}
