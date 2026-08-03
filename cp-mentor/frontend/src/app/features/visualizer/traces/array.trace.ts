import { Trace } from '../model';

export interface ArrayRotateInput { values: number[]; k: number; }

export const ARRAY_ROTATE_CODE =
`void rotate(int[] a, int k) {
  k %= a.length;
  reverse(a, 0, a.length - 1);
  reverse(a, 0, k - 1);
  reverse(a, k, a.length - 1);
}

void reverse(int[] a, int lo, int hi) {
  while (lo < hi) {
    swap(a, lo++, hi--);
  }
}`;

// Three-reverse rotation — the array-fundamentals visualizer. Not tied to a
// single pattern slug (rotation shows up inside several), so it's the
// launcher-less, /visualize/array-rotation-only entry.
export function generateArrayRotateTrace(input: ArrayRotateInput): Trace {
  const a = [...input.values];
  const k = ((input.k % a.length) + a.length) % a.length;
  const frames: Trace['frames'] = [];
  let step = 0;

  const pushSwapFrames = (lo0: number, hi0: number, label: string, codeLine: number) => {
    let lo = lo0, hi = hi0;
    frames.push({
      step: step++, explanation: `${label}: reverse the range [${lo0}, ${hi0}].`,
      state: { values: [...a] }, highlights: [{ kind: 'range', from: lo0, to: hi0, tone: 'active' }],
      pointers: [], vars: { k }, codeLine,
    });
    while (lo < hi) {
      [a[lo], a[hi]] = [a[hi], a[lo]];
      frames.push({
        step: step++, explanation: `Swap index ${lo} and ${hi}.`,
        state: { values: [...a] },
        highlights: [{ kind: 'index', index: lo, tone: 'compare' }, { kind: 'index', index: hi, tone: 'compare' }],
        pointers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi }],
        vars: { k }, codeLine: codeLine + 8,
      });
      lo++; hi--;
    }
  };

  frames.push({
    step: step++, explanation: `Rotate right by k = ${k}. Strategy: reverse the whole array, then reverse each of the two resulting pieces.`,
    state: { values: [...a] }, highlights: [], pointers: [], vars: { k }, codeLine: 0,
  });

  pushSwapFrames(0, a.length - 1, 'Step 1', 2);
  pushSwapFrames(0, k - 1, 'Step 2', 3);
  pushSwapFrames(k, a.length - 1, 'Step 3', 4);

  frames.push({
    step: step++, explanation: `Done — the array is rotated right by ${k}.`,
    state: { values: [...a] }, highlights: [{ kind: 'range', from: 0, to: a.length - 1, tone: 'answer' }],
    pointers: [], vars: { k }, codeLine: 0,
  });

  return { structure: 'array', frames, code: ARRAY_ROTATE_CODE };
}
