/**
 * Derives scholarship-relevant categories from a student's free-text activity.
 * Used to match ECs against scholarship eligibility tags. Keyword matching only —
 * it is a recommendation signal, never a factual claim about the student.
 */
export const EC_CATEGORIES = [
  'Leadership',
  'STEM',
  'Business',
  'Community',
  'Arts',
  'Sports',
  'Healthcare',
  'Music',
  'Work',
  'Volunteering',
  'Technology',
  'Media',
  'Culture',
  'Environment',
  'Faith',
  'Tutoring',
  'Entrepreneurship',
  'Competition',
] as const;

export type EcCategory = (typeof EC_CATEGORIES)[number];

const SIGNALS: { category: EcCategory; pattern: RegExp }[] = [
  { category: 'Leadership', pattern: /\b(president|vice.?president|vp|captain|leader|leadership|head|chair|founder|coordinator|exec|committee|prefect|team lead|officer|director)\b/i },
  { category: 'STEM', pattern: /\b(robotics|coding|code\b|programming|science|math|engineering|cs\b|hackathon|stem|biology|chemistry|physics|research|olympiad|first robotics|debate.*stem)\b/i },
  { category: 'Business', pattern: /\b(business|commerce|entrepreneur|deca|fbla|investment|finance|marketing|sales|company|startup|budget|accounting)\b/i },
  { category: 'Community', pattern: /\b(volunteer|community|fundrais|charity|food bank|shelter|outreach|service|neighbourhood|neighborhood|event|organi[sz]e|organi[sz]ed)\b/i },
  { category: 'Arts', pattern: /\b(art|drawing|painting|visual|photograph|design|theatre|theater|drama|dance|craft|portfolio|gallery|sculpt)\b/i },
  { category: 'Sports', pattern: /\b(soccer|football|basketball|hockey|volleyball|baseball|swim|track|field|rugby|lacrosse|gym|athlet|sport|team|coach|referee|ski|snowboard|rowing|badminton|tennis)\b/i },
  { category: 'Healthcare', pattern: /\b(health|nurse|hospital|medical|care|first aid|cpr|pharmacy|dentistry|vet|veterinar|wellness|mental health|st john)\b/i },
  { category: 'Music', pattern: /\b(music|band|choir|orchestra|instrument|piano|guitar|drum|sing|vocal|jazz|concert)\b/i },
  { category: 'Work', pattern: /\b(work|job|employ|shift|restaurant|retail|cashier|server|babysit|lifeguard|co-?op|intern)\b/i },
  { category: 'Volunteering', pattern: /\b(volunteer|mentor|tutor|peer|assistant|helper|donat|campaign|fundrais)\b/i },
  { category: 'Technology', pattern: /\b(tech|computer|app|website|software|hardware|it\b|digital|ai\b|data|web|3d print|drone|robot)\b/i },
  { category: 'Media', pattern: /\b(journal|media|news|paper|yearbook|blog|podcast|video|film|photograph|broadcast|social media)\b/i },
  { category: 'Culture', pattern: /\b(culture|cultural|club|association|language|heritage|international|indigenous|first nations|metis|inuit|diversity|pride|lgbt)\b/i },
  { category: 'Environment', pattern: /\b(environment|eco|green|recycl|climate|sustain|garden|conserv|conservation|nature|tree)\b/i },
  { category: 'Faith', pattern: /\b(church|faith|prayer|youth group|ministry|bible|mosque|temple|religious|spiritual)\b/i },
  { category: 'Tutoring', pattern: /\b(tutor|teach|mentor|coach|lesson|homework|peer assist|instruction)\b/i },
  { category: 'Entrepreneurship', pattern: /\b(startup|business|sell|sold|product|customer|profit|shop|market|venture|company)\b/i },
  { category: 'Competition', pattern: /\b(competition|compete|contest|tournament|olympiad|deca|fbma|league|playoff|championship|race)\b/i },
];

export function categoriesForEc(text: string): EcCategory[] {
  const haystack = text.trim();
  if (!haystack) return [];
  const found = new Set<EcCategory>();
  for (const { category, pattern } of SIGNALS) {
    if (pattern.test(haystack)) found.add(category);
  }
  // Keep the canonical order so tags render consistently.
  return EC_CATEGORIES.filter((c) => found.has(c));
}

export function categoriesForEcs(ecs: { name: string; role: string; detail: string }[]): EcCategory[] {
  const merged = new Set<EcCategory>();
  for (const ec of ecs) {
    for (const c of categoriesForEc(`${ec.name} ${ec.role} ${ec.detail}`)) merged.add(c);
  }
  return EC_CATEGORIES.filter((c) => merged.has(c));
}
