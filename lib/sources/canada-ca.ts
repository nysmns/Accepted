import type { Scholarship } from '@/lib/scholarships';

const URL =
  'https://www.canada.ca/en/services/benefits/education/student-aid/scholarships.html';

/** Canada.ca scholarships directory.
 *  Lists national awards in a grid: h2 titles + p paragraphs.
 *  We extract: h3 title, p description, link href.
 */
export async function fetchCanadaCa(): Promise<Scholarship[]> {
  try {
    const res = await fetch(URL, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept-Language': 'en-CA,en;q=0.9',
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    return parseCanadaCa(html);
  } catch {
    return [];
  }
}

function parseCanadaCa(html: string): Scholarship[] {
  const results: Scholarship[] = [];
  // Each award is an h3 title with a link + p description
  const sections = html.match(/<section class="col-md-6">\s*<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p>([\s\S]*?)<\/p>/gi) || [];
  for (const section of sections) {
    const titleMatch = section.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const title = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim();
    if (!title) continue;
    const descMatch = section.match(/<p>([\s\S]*?)<\/p>/i);
    const description = descMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
    const linkMatch = section.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
    const url = linkMatch?.[1] || `https://www.canada.ca/services/benefits/education/student-aid/scholarships.html`;

    if (!title) continue;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const id = `${slug}-canada-ca`;

    // Infer type from title
    let type = '';
    if (title.includes('Graduate')) type = 'Graduate';
    else if (title.includes('Postdoctoral')) type = 'Postdoctoral';
    else if (title.includes('Doctoral')) type = 'Doctoral';
    else if (title.includes('Undergraduate')) type = 'Undergraduate';
    else if (title.includes('Bursaries')) type = 'Bursary';

    // Infer field from title or description
    const fieldMap: Record<string, string[]> = {
      'Natural sciences and engineering': ['STEM'],
      'International Business': ['Business'],
      'Social sciences': ['Social Sciences'],
      'Health': ['Health'],
    };

    results.push({
      id,
      name: title,
      provider: 'Government of Canada',
      amount: 'Varies',
      amountValue: 0,
      deadline: 'rolling',
      deadlineLabel: 'Rolling',
      fields: fieldMap[title] || ['All'],
      ecTags: [],
      grades: ['Grade 12', 'Undergraduate'],
      regions: ['Canada'],
      needBased: true,
      meritBased: false,
      description: description || `View details for ${title}.`,
      url,
      source: 'canada-ca',
      verified: new Date().toISOString().slice(0, 10),
    });
  }
  return results;
}
