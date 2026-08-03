import { Trace } from '../model';

export interface NextGreaterInput { values: number[]; }

export const MONOTONIC_STACK_CODE =
`int[] nextGreater(int[] a) {
  int[] result = new int[a.length];
  Arrays.fill(result, -1);
  Deque<Integer> stack = new ArrayDeque<>(); // indices, decreasing values
  for (int i = 0; i < a.length; i++) {
    while (!stack.isEmpty() && a[stack.peek()] < a[i]) {
      result[stack.pop()] = a[i];
    }
    stack.push(i);
  }
  return result;
}`;

export function generateMonotonicStackTrace(input: NextGreaterInput): Trace {
  const a = [...input.values];
  const result = new Array(a.length).fill(-1);
  const stack: number[] = []; // holds indices
  const frames: Trace['frames'] = [];
  let step = 0, pushes = 0, pops = 0;

  const stackValues = () => stack.map(i => a[i]);

  frames.push({
    step: step++, explanation: `Keep a stack of indices whose values are decreasing top-to-bottom. Each element is pushed once and popped at most once — that's the whole O(n) argument.`,
    state: { array: [...a], stack: stackValues() }, highlights: [], pointers: [], vars: { pushes, pops }, codeLine: 3,
  });

  for (let i = 0; i < a.length; i++) {
    while (stack.length && a[stack[stack.length - 1]] < a[i]) {
      const poppedIdx = stack.pop()!;
      pops++;
      result[poppedIdx] = a[i];
      frames.push({
        step: step++, explanation: `a[${i}]=${a[i]} is bigger than the stack top (a[${poppedIdx}]=${a[poppedIdx]}) — pop it, and a[${i}] is its answer.`,
        state: { array: [...a], stack: stackValues() },
        highlights: [{ kind: 'index', index: poppedIdx, tone: 'answer' }, { kind: 'index', index: i, tone: 'active' }],
        pointers: [{ name: 'i', index: i }], vars: { pushes, pops }, codeLine: 6,
      });
    }
    stack.push(i);
    pushes++;
    frames.push({
      step: step++, explanation: `Push index ${i} (value ${a[i]}) onto the stack.`,
      state: { array: [...a], stack: stackValues() },
      highlights: [{ kind: 'index', index: i, tone: 'compare' }], pointers: [{ name: 'i', index: i }],
      vars: { pushes, pops }, codeLine: 8,
    });
  }

  frames.push({
    step: step++, explanation: `Done. ${pushes} pushes, ${pops} pops across ${a.length} elements — each index touched a constant number of times, so the nested-looking while loop is still O(n) overall.`,
    state: { array: [...a], stack: stackValues() }, highlights: [], pointers: [], vars: { pushes, pops, result: result.join(',') }, codeLine: 0,
  });

  return { structure: 'stack', frames, code: MONOTONIC_STACK_CODE };
}
