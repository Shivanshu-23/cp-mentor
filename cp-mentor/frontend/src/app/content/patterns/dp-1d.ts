// Fetched from the live, seeded backend (GET /api/v1/method/patterns/dp-1d and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const DP_1D: Pattern = {
  slug: 'dp-1d',
  name: '1D Dynamic Programming',
  category: 'DP',
  intuition: 'The answer for position i can be built from the answers at a small number of earlier positions, so instead of recomputing subproblems exponentially via plain recursion, store each subproblem\'s answer once and reuse it — like filling in a row of a spreadsheet where each cell\'s formula only references a few cells to its left.',
  recognitionTriggers: [
    'climbing stairs / number of ways to reach a step',
    'house robber',
    'maximum subarray sum',
    'coin change (minimum coins)',
    'longest increasing subsequence'
  ],
  antiTriggers: [
    'subproblems don\'t actually overlap (plain recursion or greedy suffices with no memoization benefit)',
    'the state genuinely needs two dimensions to describe (that\'s 2D DP)'
  ],
  javaTemplate: 'int[] dp = new int[n + 1];\ndp[0] = base0; dp[1] = base1;\nfor (int i = 2; i <= n; i++) {\n    dp[i] = dp[i - 1] + dp[i - 2]; // or whatever the recurrence is\n}\nreturn dp[n];',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n) for the full dp array, reducible to O(1) if only the last few states are ever needed',
  whyComplexityIsNotObvious: 'The naive recursive version of the exact same recurrence is exponential (O(2^n) for something like climbing stairs) because it recomputes the same subproblem an exponential number of times; memoizing/tabulating collapses that to O(n) by ensuring each distinct subproblem is solved exactly once — the recurrence doesn\'t change, only whether work is repeated.',
  commonMistakes: [
    'Writing the recursive recurrence correctly but forgetting to memoize, leaving it exponential',
    'Off-by-one in the base cases or array indexing (dp[i] representing \'first i elements\' vs \'element at index i\')',
    'Missing the space-optimization opportunity — keeping a full O(n) array when only the last 1-2 states are ever referenced'
  ],
  edgeCaseChecklist: [
    'n = 0 or n = 1 (base cases)',
    'negative numbers affecting max/min recurrences',
    'all zeros or all identical values',
    'empty input array'
  ],
  variants: 'Linear recurrence (Fibonacci-style, O(1) space possible); Kadane\'s-style running max/min (maximum subarray); unbounded/bounded knapsack collapsed to 1D (coin change); longest increasing subsequence (O(n^2) DP vs O(n log n) with binary search).',
  interviewFollowUps: [
    'Can you reduce the space complexity from O(n) to O(1) — which previous states does dp[i] actually depend on?',
    'How would you also return the actual sequence/path, not just the optimal value?',
    'What\'s the difference between top-down memoization and bottom-up tabulation here, and when would you prefer one?'
  ],
  relatedPatterns: [
    'dp-2d',
    'sliding-window-fixed'
  ],
  difficultyToLearn: 3,
  frequencyScore: 5
};

export const DP_1D_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '70',
    title: 'Climbing Stairs',
    url: 'https://leetcode.com/problems/climbing-stairs/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '198',
    title: 'House Robber',
    url: 'https://leetcode.com/problems/house-robber/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '300',
    title: 'Longest Increasing Subsequence',
    url: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    difficulty: 'Medium',
    role: 'HARD',
    orderIndex: 3
  },
];
