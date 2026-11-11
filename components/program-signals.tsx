import Link from "next/link";
import { averageRange, suppSignals, type EcLevel } from "@/lib/position";
import { Badge } from "./ui";

const MIN = 70;
const MAX = 100;
const pos = (n: number) =>
  Math.max(0, Math.min(100, ((n - MIN) / (MAX - MIN)) * 100));

<<<<<<< HEAD
/** Grade range as a green band on a 70-100% scale, with the student's average as a marker. */
export function RangeBar({ label, average, tone = 'light' }: { label: string; average?: number | null; tone?: 'light' | 'dark' }) {
  const range = averageRange(label);
  if (!range) return null;
  const left = pos(range[0]);
  const right = label.includes('+') ? 100 : pos(range[1]);
  const dark = tone === 'dark';
  const text = `Reference range ${label}${average != null ? `, your average ${average}%` : ''}`;
  return (
    <div role="img" aria-label={text}>
      <div className={`relative h-3 rounded-full ${dark ? 'bg-paper/20' : 'bg-sand'}`}>
        <div
          className={`absolute h-full rounded-full ${dark ? 'bg-sage' : 'bg-moss'}`}
          style={{ left: `${left}%`, width: `${Math.max(right - left, 2)}%` }}
        />
        {average != null && (
          <div
            className={`absolute -top-1.5 h-6 w-1.5 rounded-sm shadow ${dark ? 'bg-paper' : 'bg-navy'}`}
            style={{ left: `calc(${pos(average)}% - 3px)` }}
          />
        )}
      </div>
      <div className="relative mt-2 h-5 text-sm text-muted">
        {(average == null || pos(average) > 24) && <span className="absolute left-0">{MIN}%</span>}
        {average != null && (
          <span
            className={`absolute -translate-x-1/2 whitespace-nowrap font-medium ${dark ? 'text-paper' : 'text-deep'}`}
            style={{ left: `${Math.min(88, Math.max(12, pos(average)))}%` }}
          >
            You {average}%
          </span>
        )}
        {(average == null || pos(average) < 55) && <span className="absolute right-0">{MAX}%</span>}
=======
export function RangeBar({
  label,
  average,
}: {
  label: string;
  average?: number | null;
}) {
  const range = averageRange(label);
  if (!range) return null;
  const left = pos(range[0]);
  const right = label.includes("+") ? 100 : pos(range[1]);
  const text = `Reference range ${label}${average != null ? `, your average ${average}%` : ""}`;
  return (
    <div role="img" aria-label={text} className="min-w-0 w-full max-w-[240px]">
      <div className="range-track">
        <span
          className="range-band"
          style={{ left: `${left}%`, width: `${Math.max(right - left, 2)}%` }}
        />
        {average != null && (
          <span
            className="range-marker"
            style={{ left: `calc(${pos(average)}% - 1px)` }}
          />
        )}
      </div>
      <div className="mt-2 flex justify-between gap-2 font-mono text-[9px] text-muted">
        <span>{MIN}%</span>
        {average != null && <span className="text-accent">You {average}%</span>}
        <span>{MAX}%</span>
>>>>>>> pr/8
      </div>
    </div>
  );
}

export function ProgramTags({ req }: { req: string }) {
  const { longAnswer, background } = suppSignals(req);
  if (!longAnswer && !background) return null;
<<<<<<< HEAD
  const chip = 'rounded-md bg-sage/40 px-2.5 py-1 text-sm font-medium text-deep';
  return (
    <div className="flex flex-wrap gap-2">
      {longAnswer && <span className={chip}>Long answer</span>}
      {background && <span className={chip}>Background and ECs</span>}
=======
  return (
    <div className="flex flex-wrap gap-1.5">
      {longAnswer && <Badge>Long answer</Badge>}
      {background && <Badge>Background &amp; ECs</Badge>}
>>>>>>> pr/8
    </div>
  );
}
const EC_NOTE: Record<EcLevel, string> = {
<<<<<<< HEAD
  light: 'ECs are assessed here, and yours rate light. Build depth before you apply.',
  solid: 'ECs are assessed here, and yours rate solid. Show clearer impact and responsibility.',
  strong: 'ECs are assessed here, and yours rate strong. That helps this application.',
  standout: 'ECs are assessed here, and yours rate standout. A real strength for this application.',
=======
  light:
    "ECs are assessed here and yours rate light right now. Build depth before you apply.",
  solid:
    "ECs are assessed here. Yours rate solid; show clearer impact and responsibility.",
  strong:
    "ECs are assessed here. Yours rate strong, which helps this application.",
  standout:
    "ECs are assessed here. Yours rate standout, a real strength for this application.",
>>>>>>> pr/8
};
export function EcFit({ req, level }: { req: string; level: EcLevel | null }) {
<<<<<<< HEAD
  if (!suppSignals(req).background) {
    return <p className="text-sm text-muted">No ECs profile in the listed requirements.</p>;
  }
  if (!level) {
    return (
      <p className="text-sm text-muted">
        ECs are assessed here.{' '}
        <Link href="/ec-rater" className="font-medium text-moss underline underline-offset-2">
=======
  if (!suppSignals(req).background)
    return (
      <p className="fine-print">No ECs profile in the listed requirements.</p>
    );
  if (!level)
    return (
      <p className="fine-print">
        ECs are assessed here.{" "}
        <Link
          href="/ec-rater"
          className="text-accent underline underline-offset-4"
        >
>>>>>>> pr/8
          Rate your ECs
        </Link>{" "}
        to see how they fit.
      </p>
    );
<<<<<<< HEAD
  }
  return <p className="text-sm text-muted">{EC_NOTE[level]}</p>;
=======
  return <p className="fine-print">{EC_NOTE[level]}</p>;
>>>>>>> pr/8
}
