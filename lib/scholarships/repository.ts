import type { Scholarship } from '../scholarships';
import { syncScholarships } from '../sync/sync-scholarships';

let cachedMerged: Scholarship[] | null = null;
let cacheTime = 0;

/** Fetch from all configured sources, filter by date, reconcile by id.
 *  Safe to re-run; a source failure drops that source, never the whole batch. */
export async function refreshScholarships(): Promise<{
  all: Scholarship[];
  remote: Scholarship[];
  remoteCount: number;
  fetchedAt: string;
  error: string | null;
}> {
  const now = Date.now();
  if (cachedMerged && now - cacheTime < 300_000) {
    return { all: cachedMerged, remote: [], remoteCount: 0, fetchedAt: '', error: null };
  }

  const results = await syncScholarships();
  const { all, sources, fetchedAt, error } = results;
  cachedMerged = all;
  cacheTime = now;

  // Log source breakdown (server-side only)
  console.log('[scholarships-sync]', sources.map((s) => `${s.name}:${s.count}`).join(', '));

  return { all, remote: [], remoteCount: 0, fetchedAt, error };
}

/** Re-export for API route / components. */
export function getCurated(): Scholarship[] {
  return [];
}
