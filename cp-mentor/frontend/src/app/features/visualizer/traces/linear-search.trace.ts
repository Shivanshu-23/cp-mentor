import { Trace } from '../model';

export interface LinearSearchInput { values: number[]; target: number; }

export const LINEAR_SEARCH_CODE =
`int linearSearch(int[] arr, int target) {
  for (int i = 0; i < arr.length; i++) {
    if (arr[i] == target) {
      return i;
    }
  }
  return -1;
}`;

// Phase B's acceptance-criteria trace — deliberately trivial, exists to
// prove the engine (player, keyboard, SVG binding) works end-to-end.
export function generateLinearSearchTrace(input: LinearSearchInput): Trace {
  const { values, target } = input;
  const frames: Trace['frames'] = [];
  let step = 0;

  frames.push({
    step: step++,
    explanation: `Searching for ${target} in the array, left to right.`,
    state: { values },
    highlights: [],
    pointers: [],
    vars: { target, i: '—' },
    codeLine: 0,
  });

  for (let i = 0; i < values.length; i++) {
    frames.push({
      step: step++,
      explanation: `Check index ${i}: is ${values[i]} equal to ${target}?`,
      state: { values },
      highlights: [{ kind: 'index', index: i, tone: 'compare' }],
      pointers: [{ name: 'i', index: i }],
      vars: { target, i },
      codeLine: 2,
    });

    if (values[i] === target) {
      frames.push({
        step: step++,
        explanation: `Found it — index ${i} holds ${target}. Return ${i}.`,
        state: { values },
        highlights: [{ kind: 'index', index: i, tone: 'answer' }],
        pointers: [{ name: 'i', index: i }],
        vars: { target, i, result: i },
        codeLine: 3,
      });
      return { structure: 'array', frames, code: LINEAR_SEARCH_CODE };
    }
  }

  frames.push({
    step: step++,
    explanation: `Reached the end without a match. Return -1.`,
    state: { values },
    highlights: [],
    pointers: [],
    vars: { target, result: -1 },
    codeLine: 6,
  });

  return { structure: 'array', frames, code: LINEAR_SEARCH_CODE };
}
