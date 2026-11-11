export default function ScoreRing({
  score,
  size = 92,
}: {
  score: number;
  size?: number;
}) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const tone =
<<<<<<< HEAD
    clamped >= 75 ? 'text-moss' : clamped >= 55 ? 'text-brick' : 'text-brick';

=======
    clamped >= 75
      ? "text-accent"
      : clamped >= 55
        ? "text-warning"
        : "text-danger";
>>>>>>> pr/8
  return (
    <div
      role="img"
      aria-label={`Practice score ${clamped} out of 100`}
      className="score-figure relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-sand"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`score-ring-progress ${tone}`}
          stroke="currentColor"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
<<<<<<< HEAD
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display text-2xl font-semibold text-deep">{clamped}</span>
        <span className="text-[9px] font-medium text-muted">
          score
=======
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-semibold leading-none tracking-tight">
          {clamped}
>>>>>>> pr/8
        </span>
        <span className="mt-1.5 text-[9px] text-muted">OUT OF 100</span>
      </div>
    </div>
  );
}
