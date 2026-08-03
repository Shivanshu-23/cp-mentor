import { Trace } from '../model';

export interface DutchFlagInput { values: number[]; } // values are 0/1/2

export const DUTCH_FLAG_CODE =
`void sortColors(int[] a) {
  int low = 0, mid = 0, high = a.length - 1;
  while (mid <= high) {
    if (a[mid] == 0) {
      swap(a, low++, mid++);
    } else if (a[mid] == 1) {
      mid++;
    } else {
      swap(a, mid, high--); // mid does NOT advance here
    }
  }
}`;

export function generateDutchFlagTrace(input: DutchFlagInput): Trace {
  const a = [...input.values];
  const frames: Trace['frames'] = [];
  let step = 0;
  let low = 0, mid = 0, high = a.length - 1;

  const rangeHighlights = () => [
    { kind: 'range' as const, from: 0, to: low - 1, tone: 'settled' as const },
    { kind: 'range' as const, from: high + 1, to: a.length - 1, tone: 'answer' as const },
  ].filter(h => h.from <= h.to);

  frames.push({
    step: step++,
    explanation: `Three regions grow around low/mid/high: 0s settle left of low, 2s settle right of high, unknowns sit between mid and high.`,
    state: { values: [...a] }, highlights: [], pointers: [{ name: 'low', index: low }, { name: 'mid', index: mid }, { name: 'high', index: high }],
    vars: {}, codeLine: 1,
  });

  while (mid <= high) {
    const v = a[mid];
    if (v === 0) {
      [a[low], a[mid]] = [a[mid], a[low]];
      frames.push({
        step: step++, explanation: `a[mid] = 0 — swap with low, then advance BOTH low and mid (the swapped-in value is already known-good).`,
        state: { values: [...a] }, highlights: [...rangeHighlights(), { kind: 'index', index: mid, tone: 'compare' }],
        pointers: [{ name: 'low', index: low }, { name: 'mid', index: mid }, { name: 'high', index: high }],
        vars: {}, codeLine: 3,
      });
      low++; mid++;
    } else if (v === 1) {
      frames.push({
        step: step++, explanation: `a[mid] = 1 — it's already in the middle region where it belongs. Just advance mid.`,
        state: { values: [...a] }, highlights: [...rangeHighlights(), { kind: 'index', index: mid, tone: 'compare' }],
        pointers: [{ name: 'low', index: low }, { name: 'mid', index: mid }, { name: 'high', index: high }],
        vars: {}, codeLine: 5,
      });
      mid++;
    } else {
      [a[mid], a[high]] = [a[high], a[mid]];
      frames.push({
        step: step++,
        explanation: `a[mid] = 2 — swap with high and shrink high. mid does NOT advance: the value just swapped in from high is unexamined and needs its own check. This is the invariant everyone forgets.`,
        state: { values: [...a] }, highlights: [...rangeHighlights(), { kind: 'index', index: mid, tone: 'compare' }],
        pointers: [{ name: 'low', index: low }, { name: 'mid', index: mid }, { name: 'high', index: high }],
        vars: {}, codeLine: 7,
      });
      high--;
    }
  }

  frames.push({
    step: step++, explanation: `mid crossed high — all three regions are settled. Array is sorted.`,
    state: { values: [...a] }, highlights: [{ kind: 'range', from: 0, to: a.length - 1, tone: 'settled' }],
    pointers: [], vars: {}, codeLine: 0,
  });

  return { structure: 'array', frames, code: DUTCH_FLAG_CODE };
}
