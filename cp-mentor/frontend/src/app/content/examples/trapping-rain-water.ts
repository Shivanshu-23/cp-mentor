// Source: "How to Analyse and Approach a DSA Problem", Part 7 — Worked Example A: Trapping Rain Water.
import { WorkedExample } from './types';

export const TRAPPING_RAIN_WATER: WorkedExample = {
  slug: 'trapping-rain-water',
  title: 'Trapping Rain Water',
  leetcodeId: 42,
  difficulty: 'Hard',
  constraints: {
    raw: 'n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5',
    analysis:
      'n = 2×10⁴ → O(n²) ≈ 4×10⁸ operations, over budget. Target O(n) or O(n log n). height[i] ' +
      'can be 0. n can be 1, so a single bar must return 0 without crashing.'
  },
  restateAndBruteForce: {
    body: [
      'Here is what makes this problem an excellent diagnostic: most people cannot state a ' +
        'brute force. They picture water flowing, pooling, levels rising — and freeze.',
      'That freeze is the signal. It means the unit of analysis is wrong. You are modelling ' +
        'physics, not computation.'
    ]
  },
  handSolve: {
    body: [
      'Take height = [3, 0, 2, 0, 4]. Compute the water manually.',
      'You did not simulate flowing water. You went position by position and asked "how high ' +
        'can water sit here?", answering it by looking left and right for walls.',
      'That is the reframe: do not ask how much water the terrain holds. Ask how much water ' +
        'sits on top of each individual bar, then sum. Water decomposes into vertical columns, ' +
        'not pools.',
      'water[i] = min( max(height[0..i]), max(height[i..n-1]) ) - height[i]\n' +
        'answer = sum of water[i], clamped at 0'
    ]
  },
  bottleneck: {
    body: [
      'Brute force from that formula: for every index, scan left for max, scan right for max. ' +
        'O(n²) time, O(1) space. Correct, but over budget.',
      'What am I recomputing? Precisely: moving from index i to i+1, I re-scan an almost ' +
        'identical left portion to find a value I computed one step ago.',
      'Five moves: 1. Store instead of recompute → leftMax[i] relates to leftMax[i-1] by a ' +
        'one-line rule. ✅ This lands. 2. Window never moves backwards → not obvious yet. ' +
        '3. Sort first → destroys position, and position is the entire problem. ✗ 4. Only ' +
        'max/min matters → interesting; hold this thought. 5. Binary search on answer → no ' +
        'monotonic parameter. ✗',
      'Move 1 gives O(n) time, O(n) space: build a prefix-max array and a suffix-max array in ' +
        'two passes, then one final pass applying the formula.'
    ]
  },
  codeAndDryRun: {
    body: [
      'Code it. Dry run [5], [1,2,3,4] (answer 0 — a classic index-bug catcher), [3,3,3], ' +
        '[4,2,0,3,2,5] (answer 9).'
    ]
  },
  followUp: {
    body: [
      'An interviewer seeing O(n) time / O(n) space will ask for O(1) space. Return to move 4, ' +
        'which you set aside. Hint, no more: with two pointers at opposite ends, if you know ' +
        'the left max is smaller than the right max, is there anything the right side could ' +
        "still tell you about the left pointer's water level?",
      'Do not chase this until the O(n)-space version is green. One working solution beats two ' +
        'half-built ones.'
    ]
  },
  logEntry: {
    title: 'LC 42 — Trapping Rain Water',
    trigger: 'answer at index i depends on a prefix aggregate AND a suffix aggregate',
    missed: 'decompose per column, not per pool',
    family: 'prefix/suffix precomputation -> two pointer for O(1) space',
    reuseIn: 'Product of Array Except Self, Candy, Best Time to Buy and Sell Stock III'
  }
};
