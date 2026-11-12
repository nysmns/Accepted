import type { Scholarship } from '@/lib/scholarships';

const PROXY =
  process.env.NEXT_PUBLIC_CAREER_ONESTOP_PROXY || 'https://scholarships.careeronestop.org';

/** CareerOneStop "Scholarship Finder" for Canada.
 *  Returns <table> rows: Award Name, Level Of Study, Award Type, Award Amount, Deadline. */
export async function fetchCareerOneStop(): Promise<Scholarship[]> {
  try {
    const res = await fetch(`${PROXY}/Toolkit/Training/find-scholarships.aspx?keyword=Canada&sortcolumns=Deadline&curpage=1&sortdirections=DESC`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept-Language': 'en-CA,en;q=0.9',
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    return parseCareerOneStop(html);
  } catch {
    return [];
  }
}

function parseCareerOneStop(html: string): Scholarship[] {
  const results: Scholarship[] = [];
  const tableBody = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
  if (!tableBody) return results;
  const rows = tableBody[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length < 4) continue;
    const nameEl = cells[0] || '';
    const nameMatch = nameEl.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
    const name = (nameMatch?.[1] || '').trim();
    if (!name) continue;
    const levelEl = cells[1] || '';
    const level = levelEl.replace(/<[^>]+>/g, '').trim();
    const typeEl = cells[2] || '';
    const type = typeEl.replace(/<[^>]+>/g, '').trim();
    const amountEl = cells[3] || '';
    const amount = amountEl.replace(/<[^>]+>/g, '').trim();
    const deadlineEl = cells[4] || '';
    const deadline = deadlineEl.replace(/<[^>]+>/g, '').trim();

    if (!name || !deadline) continue;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const id = `${slug}-careeronestop`;

    // Normalize deadline: parse month name or "April 30" style
    let deadlineLabel = deadline || 'Rolling';
    let deadlineValue = 'rolling';
    if (deadline) {
      const parsed = parseDeadline(deadline);
      if (parsed) {
        deadlineValue = parsed.date;
        deadlineLabel = parsed.label;
      }
    }

    results.push({
      id,
      name,
      provider: typeof level === 'string' && level ? level : 'CareerOneStop',
      amount: amount || 'Varies',
      amountValue: extractAmountValue(amount),
      deadline: deadlineValue,
      deadlineLabel,
      fields: ['All'],
      ecTags: [],
      grades: ['Grade 12', 'Undergraduate'],
      regions: ['Canada'],
      needBased: true,
      meritBased: false,
      description: `CareerOneStop listing for ${name}. Level: ${level || 'Unknown'}. Type: ${type || 'Unknown'}.`,
      url: `https://www.careeronestop.org/Toolkit/Training/find-scholarships-detail.aspx?keyword=Canada&curPage=1&sortcolumns=Deadline&sortdirections=DESC&scholarshipId=${generateId(name)}`,
      source: 'careeronestop',
      verified: new Date().toISOString().slice(0, 10),
    });
  }
  return results;
}

function parseDeadline(raw: string): { date: string; label: string } | null {
  const text = raw.trim();
  if (!text) return null;
  // Try ISO date
  const iso = text.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) {
    return { date: iso[0], label: iso[0] };
  }
  // Try "April 30" or "April 30, 2027"
  const monthName = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const monthMatch = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
  if (monthMatch) {
    const month = monthName.indexOf(monthMatch[1].toLowerCase());
    const day = parseInt(text.match(/\d{1,2}/)![0], 10);
    const year = text.match(/\d{4}/);
    const dateStr = year ? `${year[0]}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : `2027-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { date: dateStr, label: text };
  }
  // Rolling / unspecified
  return { date: 'rolling', label: text };
}

function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractAmountValue(amount: string): number {
  const cleaned = amount.replace(/[^$\d.,]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned.replace('$', '').trim());
  if (isNaN(num)) {
    if (amount.includes('Up to')) return 120000;
    if (amount.includes('at least') || amount.includes('Minimum')) return 1000;
    if (amount.includes('plus') || amount.includes('per year')) return 4000;
    return 0;
  }
  return num;
}
