// Run: node --experimental-strip-types lib/score.check.ts
import assert from 'node:assert/strict';
import { scoreFrom } from './score.ts';

const all = (n: number) => ({ response: n, evidence: n, reasoning: n, reflection: n, communication: n });
assert.equal(scoreFrom(all(2), false, 300), 50); // typical answer
assert.equal(scoreFrom(all(4), false, 300), 100);
assert.equal(scoreFrom(all(4), true, 300), 55); // generic cap
assert.equal(scoreFrom(all(4), false, 40), 50); // too-short cap
assert.equal(scoreFrom(all(9), false, 300), 100); // marks clamp at 4
assert.throws(() => scoreFrom({ response: 2 }, false, 300));
console.log('score checks passed');
