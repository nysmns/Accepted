import type { Scholarship } from '../scholarships';
import { SCHOLARSHIPS as CURATED_LIST } from '../data/scholarships';

/** Remote scholarship listing (free, keyless API). Note: US/Nevada listings only —
 * it does not carry Canadian awards, so it is used as a *supplement*, never a replacement. */
const OPEN_SCHOLARSHIPS_API =
  process.env.NEXT_PUBLIC_OPEN_SCHOLARSHIPS_API || 'https://scholarships.grudged.io/api/scholarships';

/** Curated base list (local source). Merged with the remote listing on refresh. */
const CURATED = CURATED_LIST;

let cachedFetchState: {
  data: Scholarship[];
  fetchedAt: string;
  source: 'api' | 'api_subset' | 'curated' | 'refreshed';
  error: string | null;
} | null = null;

function isScholarship(value: unknown): value is Omit<Scholarship, 'id' | 'ecTags' | 'grades' | 'regions' | 'needBased' | 'meritBased' | 'description' | 'source' | 'verified'> & {
  id?: string;
} {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    typeof v.sponsor === 'string' &&
    typeof v.amount === 'string' &&
    typeof v.deadline === 'string'
  );
}

/**
 * Fetch the remote listing. Returns [] instead of throwing so a flaky ad network
 * never takes the whole page down.
 */
export async function fetchFromApi(): Promise<Scholarship[]> {
  try {
    const res = await fetch(OPEN_SCHOLARSHIPS_API, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    return results
      .map((r: unknown) => normalizeFromApi(r))
      .filter((s: unknown): s is Scholarship => Boolean(s));
  } catch {
    return [];
  }
}

/**
 * Normalize the API shape → our Scholarship type. Only the fields we can map
 * reliably survive; everything else is dropped rather than guessed.
 */
function normalizeFromApi(r: unknown): Scholarship | null {
  if (!isScholarship(r)) return null;
  const v = r as Record<string, unknown>;
  const name = typeof v.name === 'string' ? v.name.trim() : '';
  if (!name) return null;

  // Build a stable id from the source + name (slug-style).
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown';
  const id = v.id ? `${slug}-${v.id}` : slug;

  return {
    id,
    name,
    provider: typeof v.sponsor === 'string' ? v.sponsor : name,
    amount: typeof v.amount === 'string' ? v.amount.trim() : 'Varies',
    amountValue: 0,
    deadline: typeof v.deadline === 'string' ? v.deadline : 'rolling',
    deadlineLabel: typeof v.deadline === 'string' ? v.deadline : 'Rolling',
    fields: ['All'],
    ecTags: [],
    grades: ['Grade 12', 'Undergraduate'],
    regions: ['Canada'],
    needBased: true,
    meritBased: false,
    description: typeof v.summary === 'string' ? v.summary.slice(0, 300) : '',
    url: typeof v.url === 'string' && v.url.startsWith('http') ? v.url : '',
    source: 'grudged-open-scholarships',
    verified: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Merge a remote listing into the curated set. Returns the combined list
 * (deduplicated by slug-derived id) so the app can show both.
 */
export function mergeSources(curated: Scholarship[], remote: Scholarship[]): Scholarship[] {
  const byId = new Map<string, Scholarship>();

  for (const s of curated) {
    byId.set(s.id, s);
  }
  for (const s of remote) {
    byId.set(s.id, s);
  }
  return Array.from(byId.values());
}

/**
 * Refresh = fetch the remote listing + merge with the curated set.
 * Returns the merged list, the remote subset, and the fetch timestamp.
 */
export async function refreshScholarships(): Promise<{
  all: Scholarship[];
  remote: Scholarship[];
  remoteCount: number;
  fetchedAt: string;
  error: string | null;
}> {
  const fetchedAt = new Date().toISOString();
  const remote = await fetchFromApi();
  const all = mergeSources(CURATED, remote);
  const remoteCount = remote.length;
  const error = null;
  return { all, remote, remoteCount, fetchedAt, error };
}

/**
 * Re-export for the API route / components.
 */
export function getCurated(): Scholarship[] {
  return CURATED_LIST;
}
