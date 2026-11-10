export const CRITERIA = ['response', 'evidence', 'reasoning', 'reflection', 'communication'] as const;

/** Score is computed here from the model's 0-4 criteria marks, so it is repeatable and capped. */
export function scoreFrom(criteria: unknown, generic: boolean, words: number): number {
  let total = 0;
  for (const key of CRITERIA) {
    const mark = Number((criteria as Record<string, unknown> | null)?.[key]);
    if (!Number.isFinite(mark)) throw new Error(`INVALID_JSON: missing criterion ${key}`);
    total += Math.max(0, Math.min(4, Math.round(mark)));
  }
  let score = Math.round((total / (CRITERIA.length * 4)) * 100);
  if (generic) score = Math.min(score, 55);
  if (words < 60) score = Math.min(score, 50);
  return score;
}
