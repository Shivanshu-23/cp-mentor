import { Trace } from '../model';

export interface ClimbStairsInput { n: number; }

export const DP_TABLE_CODE =
`int climbStairs(int n) {
  int[] dp = new int[n + 1];
  dp[0] = 1;
  dp[1] = 1;
  for (int i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]; // bottom-up: build from what's already known
  }
  return dp[n];
}`;

// Bottom-up 1D DP, rendered as a single-row grid so dependency arrows (the
// grid renderer's own feature) point from dp[i-1]/dp[i-2] into dp[i].
export function generateDpTableTrace(input: ClimbStairsInput): Trace {
  const n = Math.max(input.n, 1);
  const dp: (number | null)[] = new Array(n + 1).fill(null);
  const frames: Trace['frames'] = [];
  let step = 0;

  const snapshot = () => ({ cells: [dp], rows: 1, cols: n + 1 });

  frames.push({
    step: step++, explanation: `Ways to climb n stairs taking 1 or 2 steps at a time. Bottom-up: fill the table from the base cases up, so dp[i] only ever looks at already-computed cells.`,
    state: snapshot(), highlights: [], pointers: [], vars: { n }, codeLine: 1,
  });

  dp[0] = 1;
  frames.push({
    step: step++, explanation: `Base case: dp[0] = 1 (one way to stand still).`,
    state: snapshot(), highlights: [{ kind: 'cell', row: 0, col: 0, tone: 'settled' }], pointers: [], vars: { n }, codeLine: 2,
  });

  if (n >= 1) {
    dp[1] = 1;
    frames.push({
      step: step++, explanation: `Base case: dp[1] = 1 (one way to take a single step).`,
      state: snapshot(), highlights: [{ kind: 'cell', row: 0, col: 1, tone: 'settled' }], pointers: [], vars: { n }, codeLine: 3,
    });
  }

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1]! + dp[i - 2]!;
    frames.push({
      step: step++,
      explanation: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`,
      state: snapshot(),
      highlights: [
        { kind: 'cell', row: 0, col: i, tone: 'active' },
        { kind: 'cell', row: 0, col: i - 1, tone: 'compare' },
        { kind: 'cell', row: 0, col: i - 2, tone: 'compare' },
        { kind: 'edge', id: `0,${i - 1},0,${i}` },
        { kind: 'edge', id: `0,${i - 2},0,${i}` },
      ],
      pointers: [], vars: { n, i }, codeLine: 5,
    });
  }

  frames.push({
    step: step++, explanation: `dp[${n}] = ${dp[n]} — the final answer, built entirely from smaller already-solved subproblems.`,
    state: snapshot(), highlights: [{ kind: 'cell', row: 0, col: n, tone: 'answer' }], pointers: [], vars: { result: dp[n]! }, codeLine: 6,
  });

  return { structure: 'grid', frames, code: DP_TABLE_CODE };
}
