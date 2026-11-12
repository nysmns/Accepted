import type { Scholarship } from '@/lib/scholarships';

const PROXY =
  process.env.NEXT_PUBLIC_STUDENT_AWARDS_PROXY || 'https://studentawards.com';

/** Student Awards study abroad directory. Paginated card grid.
 *  Each card has: name (h2 > a), provider, amount, deadline. */
const PAGE_SIZE = 50;
const MAX_PAGES = 3;

export async function fetchStudentAwards(): Promise<Scholarship[]> {
  const results: Scholarship[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const pageResults = await fetchPage(page);
    results.push(...pageResults);
    if (pageResults.length < PAGE_SIZE) break;
  }
  return results;
}

async function fetchPage(page: number): Promise<Scholarship[]> {
  const results: Scholarship[] = [];
  try {
    const res = await fetch(`${PROXY}/study-abroad/?page=${page}`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept-Language': 'en-CA,en;q=0.9',
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return results;
    const html = await res.text();
    results.push(...parseStudentAwards(html));
  } catch {
    // Page failed (rate limit or geo-block); try next page
  }
  return results;
}

function parseStudentAwards(html: string): Scholarship[] {
  const results: Scholarship[] = [];
  const cards = html.match(/<li class="card"[^>]*>([\s\S]*?)<\/li>/gi) || [];
  for (const card of cards) {
    const nameMatch = card.match(/<h2><a[^>]*>([\s\S]*?)<\/a><\/h2>/i);
    if (!nameMatch) continue;
    const name = nameMatch[1].replace(/<[^>]+>/g, '').trim();
    if (!name) continue;

    // Provider (card-provider class span)
    const providerMatch = card.match(/<p class="card-provider">([\s\S]*?)<\/p>/i);
    const provider = providerMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Student Awards';

    // Amount and deadline (card-meta spans)
    const metaMatch = card.match(/<div class="card-meta">([\s\S]*?)<\/div>/i);
    let amount = 'Varies';
    let deadline = '';
    if (metaMatch) {
      const amountMatch = metaMatch[1].match(/<span class="card-amount">[\s\S]*?<small>Amount<\/small>([\s\S]*?)<\/span>/i);
      amount = amountMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Varies';
      const deadlineMatch = metaMatch[1].match(/<span class="card-deadline">[\s\S]*?<small>Deadline<\/small>([\s\S]*?)<\/span>/i);
      deadline = deadlineMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
    }

    if (!name || !deadline) continue;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const id = `${slug}-studentawards`;

    // Normalize deadline: "April 30" or "April 30, 2027"
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
      provider,
      amount,
      amountValue: extractAmountValue(amount),
      deadline: deadlineValue,
      deadlineLabel,
      fields: ['All'],
      ecTags: [],
      grades: ['Grade 12', 'Undergraduate'],
      regions: ['Canada'],
      needBased: true,
      meritBased: false,
      description: `Student Awards listing for ${name}. Provider: ${provider}.`,
      url: `https://studentawards.com/scholarships/${slug}/${name.replace(/\s+/g, '-')}`,
      source: 'studentawards',
      verified: new Date().toISOString().slice(0, 10),
    });
  }
  return results;
}

function parseDeadline(raw: string): { date: string; label: string } | null {
  const text = raw.trim();
  if (!text) return null;
  const iso = text.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return { date: iso[0], label: iso[0] };
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
  return { date: 'rolling', label: text };
}

function extractAmountValue(amount: string): number {
  const cleaned = amount.replace(/[^$\d.,]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned.replace('$', '').trim());
  if (!isNaN(num)) return num;
  if (amount.includes('Up to')) return 120000;
  if (amount.includes('at least') || amount.includes('Minimum')) return 1000;
  if (amount.includes('plus') || amount.includes('per year')) return 4000;
  return 0;
}
