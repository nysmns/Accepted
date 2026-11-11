/**
 * Scholarship matching. Pure logic — the list itself lives in
 * lib/data/scholarships.ts and is served (and filtered to active-only) by
 * /api/scholarships.
 */

export type Scholarship = {
  id: string;
  name: string;
  provider: string;
  /** Display amount, e.g. "$5,000" or "Up to $2,000". */
  amount: string;
  /** Numeric value for sorting; 0 when the amount varies. */
  amountValue: number;
  /** ISO date (yyyy-mm-dd) or "rolling". */
  deadline: string;
  deadlineLabel: string;
  /** Fields of study the award is open to. ['All'] means no restriction. */
  fields: string[];
  /** Extracurricular / experience tags the award looks for. Empty = no requirement. */
  ecTags: string[];
  /** Who can apply, e.g. ['Grade 12', 'Undergraduate']. */
  grades: string[];
  /** Provinces covered. ['Canada'] means national. */
  regions: string[];
  needBased: boolean;
  meritBased: boolean;
  description: string;
  url: string;
  source: string;
  /** Date the entry was last checked against the provider. */
  verified: string;
};

export type StudentProfile = {
  /** Fields of study, derived from the programs the student has practised. */
  fields: string[];
  /** Extracurricular categories, derived from the student's saved activities. */
  ecCategories: string[];
  /** Saved admission average, if the student set one in the planner. */
  average: number | null;
  region: string;
};

export type ScoredScholarship = Scholarship & {
  score: number;
  reasons: string[];
};

export const ALL_FIELDS = 'All';

/** An award is active when it has no deadline yet or the deadline is still ahead. */
export function isActive(s: Scholarship, now = new Date()): boolean {
  if (s.deadline === 'rolling') return true;
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const deadline = new Date(`${s.deadline}T23:59:59Z`);
  return Number.isNaN(deadline.getTime()) ? false : deadline >= today;
}

export function activeScholarships(
  list: Scholarship[],
  now = new Date()
): Scholarship[] {
  return list.filter((s) => isActive(s, now));
}

function overlaps(list: string[], candidate: string[]): boolean {
  return candidate.some((item) => list.includes(item));
}

/**
 * Rank awards against a student profile. The score is a recommendation signal,
 * not a likelihood of winning — the UI says so.
 */
export function matchScholarships(
  list: Scholarship[],
  profile: StudentProfile
): ScoredScholarship[] {
  const fields = profile.fields.map((f) => f.trim()).filter(Boolean);
  const ecs = profile.ecCategories.map((e) => e.trim()).filter(Boolean);

  return list
    .filter((s) => isActive(s))
    .map((s) => {
      let score = 0;
      const reasons: string[] = [];

      const fieldMatch =
        s.fields.includes(ALL_FIELDS) || overlaps(s.fields, fields);
      if (fieldMatch) {
        const matched = s.fields.includes(ALL_FIELDS)
          ? fields
          : s.fields.filter((f) => fields.includes(f));
        if (matched.length) {
          score += 40;
          reasons.push(`Matches your ${matched.slice(0, 2).join(' and ')} focus`);
        } else {
          score += 25;
          reasons.push('Open to all fields of study');
        }
      } else {
        // Still show it, but it is not a targeted recommendation.
        score += 5;
      }

      const ecMatch = s.ecTags.length === 0 || overlaps(s.ecTags, ecs);
      if (s.ecTags.length > 0 && ecMatch) {
        const matched = s.ecTags.filter((t) => ecs.includes(t));
        score += Math.min(40, matched.length * 20);
        reasons.push(`Your ${matched.slice(0, 2).join(' and ').toLowerCase()} activities fit`);
      } else if (s.ecTags.length === 0) {
        score += 10;
      }

      if (s.regions.includes('Canada') || s.regions.includes(profile.region)) {
        score += 10;
      } else {
        score -= 5;
      }

      if (s.meritBased && profile.average != null) {
        if (profile.average >= 85) {
          score += 10;
          reasons.push('Your saved average is in the competitive range');
        } else if (profile.average >= 75) {
          score += 5;
        }
      }
      if (s.needBased && profile.average != null && profile.average < 80) {
        score += 5;
      }

      if (reasons.length === 0) reasons.push('Open to students in your region');

      return { ...s, score, reasons };
    })
    .sort((a, b) => b.score - a.score || b.amountValue - a.amountValue);
}

/** Group awards by how strongly they fit, for the page's sections. */
export function recommended(list: ScoredScholarship[]): ScoredScholarship[] {
  return list.filter((s) => s.score >= 60);
}

/** Group from the simulator prompt bank → scholarship field tags. */
export const FIELD_BY_GROUP: Record<string, string[]> = {
  'Business & Commerce': ['Business'],
  'Engineering & Computer Science': ['STEM', 'Technology'],
  'Health Sciences & Nursing': ['Healthcare'],
  'Arts, Design & Architecture': ['Arts'],
  Education: ['Education'],
  'Media & Communications': ['Media'],
  Trades: ['Trades'],
  Law: ['Law'],
};

export function fieldsForGroups(groups: string[]): string[] {
  const out = new Set<string>();
  for (const group of groups) {
    for (const field of FIELD_BY_GROUP[group] ?? []) out.add(field);
  }
  return [...out];
}

/** Group from the simulator prompt bank → scholarship field tags. */
export function otherActive(list: ScoredScholarship[]): ScoredScholarship[] {
  return list.filter((s) => s.score < 60);
}
