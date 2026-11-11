'use client';

import { useState } from 'react';
import { ArrowDown, Check, Sparkles } from 'lucide-react';

const STEPS = [
  'Research the programs that fit you',
  'Check requirements and verified deadlines',
  'Make time for a focused practice session',
];

/** Example workspace card for the hero. The checklist is a live toggle so the page feels usable. */
export default function HomePreview({ university, program, avg }: { university: string; program: string; avg: string }) {
  const [done, setDone] = useState([true, false, false]);

  return (
    <div className="product-preview">
      <div className="preview-window">
        <div className="preview-toolbar">
          <span className="preview-dot" />
          <span className="preview-dot" />
          <span className="preview-dot" />
          <span className="ml-auto">accepted! / your workspace</span>
        </div>
        <div className="preview-content">
          <div className="flex items-start justify-between gap-4">
            <p className="preview-route">Your application folio</p>
            <span className="badge badge-neutral">Example workspace</span>
          </div>
          <h2>
            Your shortlist.
            <br />
            Your next steps.
          </h2>

          <div className="preview-program">
            <span className="folio-number">01</span>
            <div>
              <p className="text-[10px] text-muted">{university}</p>
              <h3 className="mt-1 text-base font-semibold leading-6 tracking-tight">{program}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="badge badge-accent">{avg} reference</span>
                <span className="badge badge-neutral">Supplemental required</span>
              </div>
            </div>
          </div>

          <div className="mt-2">
            {STEPS.map((step, i) => (
              <button
                key={step}
                type="button"
                className="checklist-item"
                aria-pressed={done[i]}
                onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
              >
                <span className="check-box">{done[i] && <Check size={13} strokeWidth={3} />}</span>
                <span className="check-text">{step}</span>
              </button>
            ))}
          </div>

          <div className="preview-note">
            <Sparkles size={17} className="mt-0.5 shrink-0 text-accent" />
            <p>
              <strong className="font-semibold">Meet Nova, your practice coach.</strong>
              <br />
              Get a score, feedback, and a model rewrite for your written practice.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between px-1 text-[9px] font-medium uppercase tracking-[.08em] text-secondary">
        <span>Plan. Prepare. Reflect.</span>
        <ArrowDown size={13} />
      </div>
    </div>
  );
}
