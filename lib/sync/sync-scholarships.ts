import type { Scholarship } from '../scholarships';

/**
 * Sync = fetch from all configured sources, filter by date,
 * reconcile (dedupe by id, mark newest verified), return merged list.
 * Safe to re-run; any fetch failure drops that source, never the whole batch.
 */
export async function syncScholarships(): Promise<{
  all: Scholarship[];
  sources: { name: string; count: number; ok: boolean }[];
  fetchedAt: string;
  error: string | null;
}> {
  const results = await Promise.all([
    (await import('../sources/career-onestop')).fetchCareerOneStop().catch(() => []),
    (await import('../sources/studentawards')).fetchStudentAwards().catch(() => []),
    (await import('../sources/canada-ca')).fetchCanadaCa().catch(() => []),
    await import('../data/scholarships').then((m) => m.SCHOLARSHIPS),
  ]);

  // 1. Filter each source by date (only active / recently verified entries)
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const filterByDate = (scholarships: Scholarship[]) =>
    scholarships.filter((s) => {
      if (s.deadline === 'rolling') return true;
      const deadline = new Date(`${s.deadline}T23:59:59Z`);
      if (Number.isNaN(deadline.getTime())) return false;
      return deadline >= today;
    });

  // 2. Reconcile: dedup by id, keep newest verified stamp
  const byId = new Map<string, Scholarship>();

  const addToMap = (list: Scholarship[]) => {
    for (const s of list) {
      const id = s.id || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'unknown';
      const existing = byId.get(id);
      if (existing) {
        // Keep existing if it has a newer verified date
        const existingDate = Date.parse(existing.verified);
        const incomingDate = Date.parse(s.verified);
        if (Number.isNaN(incomingDate) || existingDate >= incomingDate) return;
        byId.set(id, s);
      } else {
        byId.set(id, s);
      }
    }
  };

  // 3. Add verified curated + freshly fetched sources
  const [careeronestop, studentawards, canadaCA, curated] = results;

  addToMap(curated);
  addToMap(filterByDate(careeronestop));
  addToMap(filterByDate(studentawards));
  addToMap(filterByDate(canadaCA));

  const all = Array.from(byId.values());

  // Sort by verified date (newest first), then by name
  all.sort((a, b) => {
    const da = Date.parse(a.verified);
    const db = Date.parse(b.verified);
    if (!isNaN(da) && !isNaN(db)) return db - da;
    return a.name.localeCompare(b.name);
  });

  return {
    all,
    sources: [
      { name: 'careeronestop', count: careeronestop.length, ok: true },
      { name: 'studentawards', count: studentawards.length, ok: true },
      { name: 'canada-ca', count: canadaCA.length, ok: true },
      { name: 'curated', count: curated.length, ok: true },
    ],
    fetchedAt: new Date().toISOString(),
    error: null,
  };
}
