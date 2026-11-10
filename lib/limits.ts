export const WRITTEN_MAX_WORDS = 400;
export const SPOKEN_MAX_WORDS = 250;
export const SPOKEN_MAX_SECONDS = 100;
export const EC_DETAIL_MAX_WORDS = 80;

export const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
export const limitWords = (text: string, max: number) =>
  text.trim().split(/\s+/).filter(Boolean).slice(0, max).join(' ');
