import { Trace } from '../model';

export interface SortInput { values: number[]; }

export const SELECTION_SORT_CODE =
`void selectionSort(int[] a) {
  for (int i = 0; i < a.length - 1; i++) {
    int minIdx = i;
    for (int j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) minIdx = j;
    }
    swap(a, i, minIdx);
  }
}`;

// Selection sort — chosen over merge/quick/heap sort for this pass: it
// reuses the array renderer's existing settled-prefix/compare tone language
// directly with no extra structure. Merge/quick/heap's recursive split and
// dual-view heap representation are noted as future extensions, not built
// this round — see CLAUDE.md.
export function generateSelectionSortTrace(input: SortInput): Trace {
  const a = [...input.values];
  const frames: Trace['frames'] = [];
  let step = 0;

  frames.push({
    step: step++, explanation: `Selection sort: repeatedly find the minimum of the unsorted suffix and swap it to the front of that suffix.`,
    state: { values: [...a] }, highlights: [], pointers: [], vars: {}, codeLine: 1,
  });

  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    frames.push({
      step: step++, explanation: `Settled prefix is [0, ${i - 1}]. Scan [${i}, ${a.length - 1}] for the minimum.`,
      state: { values: [...a] },
      highlights: [{ kind: 'range', from: 0, to: i - 1, tone: 'settled' }, { kind: 'index', index: i, tone: 'compare' }],
      pointers: [{ name: 'min', index: minIdx }], vars: {}, codeLine: 2,
    });

    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) {
        minIdx = j;
        frames.push({
          step: step++, explanation: `a[${j}] = ${a[j]} is smaller than the current minimum (a[${minIdx === j ? i : minIdx}]) — new minimum candidate.`,
          state: { values: [...a] },
          highlights: [{ kind: 'range', from: 0, to: i - 1, tone: 'settled' }, { kind: 'index', index: j, tone: 'active' }],
          pointers: [{ name: 'min', index: minIdx }], vars: {}, codeLine: 5,
        });
      }
    }

    [a[i], a[minIdx]] = [a[minIdx], a[i]];
    frames.push({
      step: step++, explanation: `Swap the minimum (index ${minIdx}) into position ${i}. Prefix [0, ${i}] is now settled.`,
      state: { values: [...a] },
      highlights: [{ kind: 'range', from: 0, to: i, tone: 'settled' }],
      pointers: [], vars: {}, codeLine: 7,
    });
  }

  frames.push({
    step: step++, explanation: `Fully sorted.`,
    state: { values: [...a] }, highlights: [{ kind: 'range', from: 0, to: a.length - 1, tone: 'settled' }],
    pointers: [], vars: {}, codeLine: 0,
  });

  return { structure: 'array', frames, code: SELECTION_SORT_CODE };
}
