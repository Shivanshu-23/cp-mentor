// Source: "How to Analyse and Approach a DSA Problem", Part 8 — Worked Example B: Koko Eating Bananas.
import { WorkedExample } from './types';

export const KOKO_EATING_BANANAS: WorkedExample = {
  slug: 'koko-eating-bananas',
  title: 'Koko Eating Bananas',
  leetcodeId: 875,
  difficulty: 'Medium',
  intro: 'A deliberately different family, to show the method generalises.',
  constraints: {
    raw: '1 <= piles.length <= 10^4\npiles.length <= h <= 10^9\n1 <= piles[i] <= 10^9',
    analysis:
      "Two things jump out. piles[i] up to 10⁹ means the answer space is huge even though the " +
      'array is small. And h up to 10⁹ means any solution that iterates over hours is dead. ' +
      'When the array is small (10⁴) but the value range is enormous (10⁹), that mismatch is ' +
      'itself the hint: you are searching over values, not over positions.'
  },
  restateAndBruteForce: {
    body: [
      'Restated: "Find the smallest eating speed k such that finishing all piles at k bananas ' +
        'per hour takes at most h hours."',
      'Brute force: try k = 1, 2, 3, ... up to max(piles). For each, compute hours needed. ' +
        'Return the first k that fits. O(max(piles) × n) = 10⁹ × 10⁴. Absurdly slow, but it is ' +
        'a baseline and it defines correctness.'
    ]
  },
  handSolve: {
    body: [
      'piles = [3, 6, 7, 11], h = 8.',
      'k = 1 → 3 + 6 + 7 + 11 = 27 hours. Too slow.\n' +
        'k = 2 → 2 + 3 + 4 + 6 = 15. Too slow.\n' +
        'k = 3 → 1 + 2 + 3 + 4 = 10. Too slow.\n' +
        'k = 4 → 1 + 2 + 2 + 3 = 8. Fits.\n' +
        'k = 5 → 1 + 2 + 2 + 3 = 8. Also fits.',
      'Answer: 4.',
      'What did your hand notice? Hours needed only ever decreases as k increases. Once a ' +
        'speed works, every faster speed also works.'
    ]
  },
  bottleneck: {
    body: [
      'What am I recomputing? I am testing every k one at a time, when the results have a ' +
        'monotonic structure I am ignoring.',
      'Five moves: 1. Store instead of recompute → nothing repeats meaningfully. ✗ 2. Window ' +
        'never moves backwards → not a window problem. ✗ 3. Sort first → order of piles is ' +
        'irrelevant to the answer. ✗ 4. Only max/min matters → not quite. ✗ 5. The answer is ' +
        'monotonic in a parameter → ✅ k works ⟹ k+1 works.',
      'Binary search over k in the range [1, max(piles)]. Each check is O(n). Total ' +
        'O(n log(max piles)) ≈ 10⁴ × 30. Trivially fast.',
      'The key structural insight, and the one worth logging: you are binary searching the ' +
        'answer space, not the input array. The array is never sorted at all.'
    ]
  },
  javaGotcha: {
    body: [
      'Hours for one pile is ceil(pile / k), which in integer arithmetic is ' +
        '(pile + k - 1) / k. Accumulate into a long — with 10⁴ piles of 10⁹ each and k = 1, ' +
        'the sum overflows int immediately. This exact overflow is the most common wrong-answer ' +
        'on this problem.'
    ]
  },
  logEntry: {
    title: 'LC 875 — Koko Eating Bananas',
    trigger: '"minimum X such that a condition holds" + huge value range, small array',
    missed: 'feasibility is monotonic in k -> binary search the ANSWER, not the array',
    family: 'binary search on answer space',
    reuseIn: 'Split Array Largest Sum, Capacity to Ship Packages, Min Days to Make Bouquets'
  }
};
