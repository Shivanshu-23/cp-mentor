import { Trace } from '../model';

export interface PrefixSumInput { values: number[]; queryL: number; queryR: number; }

export const PREFIX_SUM_CODE =
`int[] buildPrefix(int[] a) {
  int[] prefix = new int[a.length + 1];
  for (int i = 0; i < a.length; i++) {
    prefix[i + 1] = prefix[i] + a[i];
  }
  return prefix;
}

int rangeSum(int[] prefix, int l, int r) {
  return prefix[r + 1] - prefix[l]; // inclusive [l, r]
}`;

export function generatePrefixSumTrace(input: PrefixSumInput): Trace {
  const a = [...input.values];
  const prefix = [0];
  const frames: Trace['frames'] = [];
  let step = 0;

  frames.push({
    step: step++, explanation: `Build a running-total row once, up front — every future range-sum query becomes a single subtraction instead of a re-scan.`,
    state: { values: [...a] }, highlights: [], pointers: [], vars: {}, codeLine: 1,
  });

  for (let i = 0; i < a.length; i++) {
    prefix.push(prefix[i] + a[i]);
    frames.push({
      step: step++, explanation: `prefix[${i + 1}] = prefix[${i}] + a[${i}] = ${prefix[i]} + ${a[i]} = ${prefix[i + 1]}.`,
      state: { values: prefix.slice(1).concat(new Array(a.length - i - 1).fill('·')) },
      highlights: [{ kind: 'index', index: i, tone: 'active' }], pointers: [], vars: {}, codeLine: 3,
    });
  }

  const { queryL: l, queryR: r } = input;
  const rangeSum = prefix[r + 1] - prefix[l];
  frames.push({
    step: step++,
    explanation: `Range sum [${l}, ${r}] = prefix[${r + 1}] − prefix[${l}] = ${prefix[r + 1]} − ${prefix[l]} = ${rangeSum}. One subtraction, no re-scanning the range.`,
    state: { values: prefix.slice(1) },
    highlights: [{ kind: 'range', from: l, to: r, tone: 'answer' }],
    pointers: [], vars: { l, r, rangeSum }, codeLine: 9,
  });

  return { structure: 'array', frames, code: PREFIX_SUM_CODE };
}
