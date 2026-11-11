<<<<<<< HEAD
import InstagramIcon from './instagram-icon';
import { SITE } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="band-dark mt-auto bg-deep text-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="font-display text-2xl text-paper">Accepted!</p>
          <p className="mt-2 text-[15px] leading-6 text-paper/70">
            An independent preparation resource for Ontario Grade 12 students. Feedback is a practice aid, not an
            admissions decision. Confirm requirements and deadlines with each university and OUAC.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
          <a href={SITE.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sage hover:underline">
            <InstagramIcon className="h-4 w-4" />
            {SITE.instagramHandle}
          </a>
          <a href={SITE.feedbackForm} target="_blank" rel="noreferrer" className="text-sage hover:underline">
            Tell us how to improve
=======
import { ArrowUpRight } from "lucide-react";
import InstagramIcon from "./instagram-icon";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>
          © 2026 Accepted! <span className="mx-1">·</span> An independent
          Ontario admissions resource.
        </p>
        <div className="footer-links">
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5"
          >
            <InstagramIcon className="h-3 w-3" />
            {SITE.instagramHandle}
          </a>
          <a
            href={SITE.feedbackForm}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1"
          >
            Share feedback <ArrowUpRight size={12} />
>>>>>>> pr/8
          </a>
        </div>
      </div>
    </footer>
  );
}
