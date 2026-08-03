// Fetched from the live, seeded backend (GET /api/v1/method/patterns/monotonic-deque and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const MONOTONIC_DEQUE: Pattern = {
  slug: 'monotonic-deque',
  name: 'Monotonic Deque',
  category: 'ARRAY',
  intuition: 'Like a monotonic stack, but elements can also expire from the front once they slide out of a window — a double-ended queue keeps the front always holding the current window\'s max (or min) candidate, discarding anything from the back that a new, better element makes irrelevant.',
  recognitionTriggers: [
    'sliding window maximum/minimum',
    'maximum in every window of size k',
    'shortest subarray with sum at least K'
  ],
  antiTriggers: [
    'no window is involved at all (plain monotonic stack suffices)',
    'need every element\'s rank, not just the window extremum'
  ],
  javaTemplate: 'Deque<Integer> deque = new ArrayDeque<>(); // indices, values decreasing front-to-back\nint[] result = new int[n - k + 1];\nfor (int i = 0; i < n; i++) {\n    while (!deque.isEmpty() && deque.peekFirst() <= i - k) deque.pollFirst(); // expire out-of-window\n    while (!deque.isEmpty() && arr[deque.peekLast()] < arr[i]) deque.pollLast(); // remove dominated\n    deque.offerLast(i);\n    if (i >= k - 1) result[i - k + 1] = arr[deque.peekFirst()];\n}',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(k)',
  whyComplexityIsNotObvious: 'Same amortized argument as a monotonic stack — each index enters and leaves the deque at most once total across the whole run (once from the back when dominated, once from the front when it expires), so the two nested while loops still sum to O(n) overall, not O(n*k).',
  commonMistakes: [
    'Comparing values instead of indices when checking window expiry from the front',
    'Using <= vs < inconsistently between the front-expiry check and the back-domination check',
    'Forgetting to record a result before the window has fully filled (i < k - 1)'
  ],
  edgeCaseChecklist: [
    'k equal to array length',
    'k = 1 (every element is its own window)',
    'strictly increasing or decreasing input',
    'duplicate maximum values within a window'
  ],
  variants: 'Sliding window maximum (decreasing deque); sliding window minimum (increasing deque); shortest subarray with sum at least K (deque over prefix sums).',
  interviewFollowUps: [
    'Why is it safe to discard smaller elements from the back — could they ever become the answer later?',
    'How would this generalize to a window of variable size?',
    'Compare this to a heap-based approach — what\'s the tradeoff?'
  ],
  relatedPatterns: [
    'monotonic-stack',
    'sliding-window-fixed'
  ],
  difficultyToLearn: 4,
  frequencyScore: 3
};

export const MONOTONIC_DEQUE_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '239',
    title: 'Sliding Window Maximum',
    url: 'https://leetcode.com/problems/sliding-window-maximum/',
    difficulty: 'Hard',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '862',
    title: 'Shortest Subarray with Sum at Least K',
    url: 'https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 2
  },
];
