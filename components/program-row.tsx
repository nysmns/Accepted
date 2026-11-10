import Link from 'next/link';
import { ArrowRight, Trash2 } from 'lucide-react';
import { academicPosition, type EcLevel } from '@/lib/position';
import { EcFit, ProgramTags, RangeBar } from './program-signals';

type Props = {
  name: string;
  university?: string;
  avg: string;
  req: string;
  deadline: string;
  code: string;
  average: number | null;
  ecLevel: EcLevel | null;
  onRemove?: () => void;
};

/** One program: what it asks on the left, where you stand on the right. Used by Programs and Planner. */
export default function ProgramRow({ name, university, avg, req, deadline, code, average, ecLevel, onRemove }: Props) {
  const position = average != null ? academicPosition(average, avg) : null;
  return (
    <article className="grid gap-5 py-7 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-12">
      <div>
        {university && <p className="text-sm text-muted">{university}</p>}
        <h3 className="font-display text-xl font-medium leading-snug text-deep">{name}</h3>
        <p className="mt-2 max-w-prose text-[15px] leading-7 text-muted">{req}</p>
        <div className="mt-3">
          <ProgramTags req={req} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-muted">Competitive average</span>
          <span className="font-display text-2xl font-medium text-moss">{avg}</span>
        </div>
        <RangeBar label={avg} average={average} />
        {position && <p className={`text-sm font-medium ${position.tone}`}>{position.title}</p>}
        <EcFit req={req} level={ecLevel} />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
          <span className="text-muted">
            Deadline <span className="font-medium text-deep">{deadline}</span>
          </span>
          <span className="flex items-center gap-4">
            <Link href={`/simulator?program=${code}`} className="inline-flex items-center gap-1.5 font-medium text-moss hover:underline">
              Practise this application <ArrowRight className="h-4 w-4" />
            </Link>
            {onRemove && (
              <button onClick={onRemove} aria-label={`Remove ${name}`} className="rounded-md p-1.5 text-muted transition hover:text-brick">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
