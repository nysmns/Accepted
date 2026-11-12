import type { Scholarship } from '../scholarships';
import { syncScholarships } from '../sync/sync-scholarships';

let cachedMerged: { all: Scholarship[]; fetchedAt: string; sourceCount: number } | null = null;
let cacheTime = 0;

/** Fetch from all configured sources, filter by date, reconcile by id.
 *  Safe to re-run; a source failure drops that source, never the whole batch. */
export async function refreshScholarships(): Promise<{
  all: Scholarship[];
  fetchedAt: string;
  sourceCount: number;
  error: string | null;
}> {
  const now = Date.now();
  if (cachedMerged && now - cacheTime < 300_000) {
    return { all: cachedMerged.all, fetchedAt: cachedMerged.fetchedAt, sourceCount: cachedMerged.sourceCount, error: null };
  }

  const results = await syncScholarships();
  const { all, sources, fetchedAt, error } = results;
  cachedMerged = { all, fetchedAt, sourceCount: sources.reduce((sum, s) => sum + s.count, 0) };
  cacheTime = now;

  // Log source breakdown (server-side only)
  console.log('[scholarships-sync]', sources.map((s) => `${s.name}:${s.count}`).join(', '));

  return { all, fetchedAt, sourceCount: all.length, error };
}

/** Re-export for API route / components. */
export function getCurated(): Scholarship[] {
  return [];
}
