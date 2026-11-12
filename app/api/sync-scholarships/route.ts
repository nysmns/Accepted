import { NextResponse } from 'next/server';
import { refreshScholarships } from '@/lib/scholarships/repository';

/** Vercel cron endpoint. Syncs all scholarship sources on a scheduled interval.
 *  See vercel.json for the cron schedule. */
export async function GET() {
  try {
    const results = await refreshScholarships();
    return NextResponse.json({
      ok: true,
      count: results.all.length,
      sources: [{ name: 'sync', count: results.all.length, ok: true }],
      fetchedAt: results.fetchedAt,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
