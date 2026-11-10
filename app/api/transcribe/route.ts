import { NextResponse } from 'next/server';
import { GROQ_BASE, groqKey } from '@/lib/ai';
import { SPOKEN_MAX_WORDS, limitWords } from '@/lib/limits';
import { quotaBlock, recordUsage, releaseUsage } from '@/lib/quota';
import { getSessionUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_BYTES = 2_500_000; // ~100s of speech; stays under Vercel's 4.5MB body limit

/** Speech to text for mock-interview answers. Audio is forwarded to Groq and never stored. */
export async function POST(req: Request) {
  const user = await getSessionUser(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Sign in to use voice answers.' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const audio = form?.get('audio');
  if (!(audio instanceof File) || audio.size < 2_000 || audio.size > MAX_BYTES) {
    return NextResponse.json({ error: 'That recording was empty or too long. Try again.' }, { status: 400 });
  }

  let usageId: number | null = null;
  try {
    const block = await quotaBlock(user.id, 'stt');
    if (block) return NextResponse.json({ error: block.message }, { status: block.status });
    usageId = await recordUsage(user.id, 'stt');

    const ext = audio.type.includes('mp4') ? 'mp4' : audio.type.includes('ogg') ? 'ogg' : 'webm';
    const out = new FormData();
    out.append('file', audio, `answer.${ext}`);
    out.append('model', process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo');
    out.append('language', 'en');
    out.append('response_format', 'json');
    out.append('temperature', '0');

    const res = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey()}` },
      body: out,
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`GROQ_${res.status}: ${(await res.text()).slice(0, 200)}`);
    const { text } = await res.json();
    if (typeof text !== 'string' || !text.trim()) {
      await releaseUsage(usageId);
      return NextResponse.json({ error: 'We could not hear anything. Check your microphone and try again.' }, { status: 422 });
    }
    return NextResponse.json({ text: limitWords(text, SPOKEN_MAX_WORDS) });
  } catch (error) {
    await releaseUsage(usageId).catch(() => undefined);
    console.error('Transcription failed:', error);
    return NextResponse.json({ error: 'Could not transcribe that recording. Try again, or type your answer.' }, { status: 502 });
  }
}
