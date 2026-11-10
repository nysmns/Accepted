import { readFileSync } from 'node:fs';
import path from 'node:path';

export const GROQ_BASE = 'https://api.groq.com/openai/v1';
export const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const CALL_TIMEOUT_MS = 15_000; // keeps a request well inside Vercel's 30s limit

export function groqKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set. Add it to .env.local or Vercel env vars.');
  return key;
}

let cachedPersona: string | null = null;

/** Nova's system prompt. Edit lib/persona.md to change the voice. */
export function getPersona(): string {
  if (cachedPersona) return cachedPersona;
  try {
    cachedPersona = readFileSync(path.join(process.cwd(), 'lib', 'persona.md'), 'utf8');
  } catch {
    cachedPersona = 'You are a strict admissions officer. Score only what is on the page. Output JSON only.';
  }
  return cachedPersona;
}

export function extractJSON(text: string): unknown {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  for (const candidate of [text, first !== -1 && last > first ? text.slice(first, last + 1) : '']) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try the next candidate
    }
  }
  throw new Error('INVALID_JSON: response was not valid JSON');
}

/** One Groq chat call in JSON mode. 429s are thrown straight away so the caller can back off. */
export async function generateJSON<T>(prompt: string, maxTokens = 700): Promise<T> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${GROQ_BASE}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.1,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: getPersona() },
            { role: 'user', content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`GROQ_${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      return extractJSON(data.choices?.[0]?.message?.content ?? '') as T;
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : '';
      if (!/INVALID_JSON|GROQ_5\d\d/.test(msg)) throw e; // only bad JSON and 5xx are worth one retry
    }
  }
  throw lastError ?? new Error('Evaluation failed.');
}
