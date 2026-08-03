// Fetched from the live, seeded backend (GET /api/v1/method/patterns/prefix-sum and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const PREFIX_SUM: Pattern = {
  slug: 'prefix-sum',
  name: 'Prefix Sum',
  category: 'ARRAY',
  intuition: 'Precompute the running total up to every index once, so the sum of any range becomes a single subtraction — like keeping an odometer reading at every mile marker so trip distance between any two markers is just one subtraction away.',
  recognitionTriggers: [
    'range sum query',
    'subarray sum equals K',
    'multiple queries on same array',
    'cumulative sum'
  ],
  antiTriggers: [
    'array is being mutated between queries (need a Fenwick tree/segment tree instead)',
    'only a single range sum is ever asked (prefix array is overkill)'
  ],
  javaTemplate: 'int[] prefix = new int[n + 1];\nfor (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + arr[i];\n// sum of arr[l..r] inclusive:\nint rangeSum = prefix[r + 1] - prefix[l];',
  timeComplexity: 'O(n) to build, O(1) per range query',
  spaceComplexity: 'O(n)',
  whyComplexityIsNotObvious: 'It trades O(n) per-query brute force for O(n) one-time preprocessing plus O(1) per query — the win only shows up when there are many queries; for a single query it\'s strictly worse than just summing directly.',
  commonMistakes: [
    'Off-by-one between prefix[i] meaning \'sum up to i\' vs \'sum up to i-1\'',
    'Forgetting the prefix array needs size n+1 to represent the empty prefix',
    'Using prefix sums when the array is mutated frequently (should use a Fenwick/segment tree)'
  ],
  edgeCaseChecklist: [
    'range covering the entire array',
    'range of length 0',
    'negative numbers making running sum non-monotonic',
    'target sum of 0'
  ],
  variants: '1D prefix sum for range sums; 2D prefix sum for submatrix sums; prefix XOR for subarray XOR queries; prefix sum plus a hashmap of seen sums for \'subarray sum equals K\' style problems.',
  interviewFollowUps: [
    'What if the array is updated between queries — how does that change your approach?',
    'How would you extend this to a 2D matrix?',
    'Can you do this with O(1) extra space instead of an auxiliary prefix array?'
  ],
  relatedPatterns: [
    'hashing-frequency',
    'sliding-window-fixed'
  ],
  difficultyToLearn: 2,
  frequencyScore: 4
};

export const PREFIX_SUM_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '303',
    title: 'Range Sum Query - Immutable',
    url: 'https://leetcode.com/problems/range-sum-query-immutable/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '560',
    title: 'Subarray Sum Equals K',
    url: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '304',
    title: 'Range Sum Query 2D - Immutable',
    url: 'https://leetcode.com/problems/range-sum-query-2d-immutable/',
    difficulty: 'Medium',
    role: 'VARIANT',
    orderIndex: 3
  },
];
