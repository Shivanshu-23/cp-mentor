// Fetched from the live, seeded backend (GET /api/v1/method/patterns/sliding-window-fixed and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const SLIDING_WINDOW_FIXED: Pattern = {
  slug: 'sliding-window-fixed',
  name: 'Sliding Window (Fixed Size)',
  category: 'ARRAY',
  intuition: 'A window of constant size k slides across the array one step at a time; instead of recomputing the window\'s sum/state from scratch, you subtract the element leaving and add the element entering — like reading through a fixed-width viewport over a strip of film.',
  recognitionTriggers: [
    'subarray of size k',
    'fixed window',
    'average of every k elements',
    'maximum sum subarray of length k'
  ],
  antiTriggers: [
    'window size itself needs to be found (that\'s variable window)',
    'non-contiguous subsequence'
  ],
  javaTemplate: 'int windowSum = 0;\nfor (int i = 0; i < k; i++) windowSum += arr[i];\nint best = windowSum;\nfor (int i = k; i < arr.length; i++) {\n    windowSum += arr[i] - arr[i - k];\n    best = Math.max(best, windowSum);\n}',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  whyComplexityIsNotObvious: 'Naively recomputing the sum of every window is O(n*k); the incremental subtract-then-add trick removes the inner loop entirely so each element is touched exactly twice (once entering, once leaving).',
  commonMistakes: [
    'Recomputing the whole window sum on every slide instead of updating incrementally',
    'Off-by-one on the initial window boundary',
    'Not handling k greater than the array length'
  ],
  edgeCaseChecklist: [
    'k equals array length',
    'k greater than array length',
    'k = 1',
    'all elements identical'
  ],
  variants: 'Fixed window with a running sum (numeric); fixed window with a frequency map (anagram-in-string detection); fixed window with a monotonic deque for max/min in every window.',
  interviewFollowUps: [
    'How would this change if k were not fixed but given as a percentage of array length?',
    'Can you find the max of every window, not just the sum?',
    'What if the array is a stream and you can\'t store the whole thing?'
  ],
  relatedPatterns: [
    'sliding-window-variable',
    'monotonic-deque',
    'prefix-sum'
  ],
  difficultyToLearn: 1,
  frequencyScore: 4
};

export const SLIDING_WINDOW_FIXED_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '643',
    title: 'Maximum Average Subarray I',
    url: 'https://leetcode.com/problems/maximum-average-subarray-i/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '567',
    title: 'Permutation in String',
    url: 'https://leetcode.com/problems/permutation-in-string/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '239',
    title: 'Sliding Window Maximum',
    url: 'https://leetcode.com/problems/sliding-window-maximum/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
];
