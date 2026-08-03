import { Trace } from '../model';

export interface AnagramInput { a: string; b: string; }

export const ANAGRAM_CODE =
`boolean isAnagram(String a, String b) {
  if (a.length() != b.length()) return false;
  int[] freq = new int[26];
  for (char c : a.toCharArray()) freq[c - 'a']++;
  for (char c : b.toCharArray()) freq[c - 'a']--;
  for (int f : freq) if (f != 0) return false;
  return true;
}`;

export function generateAnagramTrace(input: AnagramInput): Trace {
  const a = input.a.toLowerCase();
  const b = input.b.toLowerCase();
  const frames: Trace['frames'] = [];
  let step = 0;
  const freq = new Array(26).fill(0);
  const letter = (i: number) => String.fromCharCode(97 + i);

  if (a.length !== b.length) {
    frames.push({
      step: step++, explanation: `Different lengths ("${a}" vs "${b}") — can't be anagrams. Return false immediately.`,
      state: { values: freq.map((_, i) => letter(i)) }, highlights: [], pointers: [], vars: { result: false }, codeLine: 1,
    });
    return { structure: 'array', frames, code: ANAGRAM_CODE };
  }

  frames.push({
    step: step++, explanation: `Same length. Build a 26-slot letter-frequency counter, one slot per a-z.`,
    state: { values: freq.map((_, i) => letter(i)) }, highlights: [], pointers: [], vars: { a, b }, codeLine: 2,
  });

  for (const c of a) {
    const idx = c.charCodeAt(0) - 97;
    freq[idx]++;
    frames.push({
      step: step++, explanation: `Reading "${a}": increment the '${c}' slot.`,
      state: { values: freq.map((f, i) => `${letter(i)}:${f}`) },
      highlights: [{ kind: 'index', index: idx, tone: 'active' }], pointers: [], vars: { a, b }, codeLine: 3,
    });
  }

  for (const c of b) {
    const idx = c.charCodeAt(0) - 97;
    freq[idx]--;
    frames.push({
      step: step++, explanation: `Reading "${b}": decrement the '${c}' slot.`,
      state: { values: freq.map((f, i) => `${letter(i)}:${f}`) },
      highlights: [{ kind: 'index', index: idx, tone: 'compare' }], pointers: [], vars: { a, b }, codeLine: 4,
    });
  }

  const isAnagram = freq.every(f => f === 0);
  frames.push({
    step: step++,
    explanation: isAnagram
      ? `Every slot cancelled back to zero — "${a}" and "${b}" are anagrams.`
      : `At least one slot is non-zero — not an anagram.`,
    state: { values: freq.map((f, i) => `${letter(i)}:${f}`) },
    highlights: freq.map((f, i) => ({ kind: 'index' as const, index: i, tone: f === 0 ? 'settled' as const : 'answer' as const })).filter(h => freq[h.index!] !== 0 || isAnagram).slice(0, 5),
    pointers: [], vars: { result: isAnagram }, codeLine: 5,
  });

  return { structure: 'array', frames, code: ANAGRAM_CODE };
}
