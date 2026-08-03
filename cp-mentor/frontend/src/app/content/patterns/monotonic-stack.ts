// Fetched from the live, seeded backend (GET /api/v1/method/patterns/monotonic-stack and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const MONOTONIC_STACK: Pattern = {
  slug: 'monotonic-stack',
  name: 'Monotonic Stack',
  category: 'ARRAY',
  intuition: 'Keep a stack that\'s always increasing or decreasing; when a new element would break that order, pop everything it invalidates first — each popped element just found its answer in the element that\'s pushing it out, like a queue of people where anyone shorter than a new arrival steps aside because they now know who\'s \'next taller\' for them.',
  recognitionTriggers: [
    'next greater element',
    'next smaller element',
    'largest rectangle in histogram',
    'daily temperatures',
    'stock span'
  ],
  antiTriggers: [
    'you need the answer relative to ALL previous elements, not just the nearest qualifying one',
    'the array is being modified while queried'
  ],
  javaTemplate: 'Deque<Integer> stack = new ArrayDeque<>(); // stores indices\nint[] result = new int[n];\nArrays.fill(result, -1);\nfor (int i = 0; i < n; i++) {\n    while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {\n        result[stack.pop()] = arr[i]; // arr[i] is the next-greater value for the popped index\n    }\n    stack.push(i);\n}',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  whyComplexityIsNotObvious: 'There\'s a while loop nested inside a for loop, which looks O(n^2), but amortized analysis shows each index is pushed exactly once and popped at most once across the entire run — so total push+pop operations are bounded by 2n, making it O(n) amortized.',
  commonMistakes: [
    'Storing values instead of indices, losing the ability to compute distances or update the result array by position',
    'Getting the stack direction backwards (increasing vs decreasing) for the specific \'next greater\' vs \'next smaller\' variant',
    'Forgetting to drain the stack after the loop for elements that never found a match'
  ],
  edgeCaseChecklist: [
    'strictly increasing input (stack never pops)',
    'strictly decreasing input (everything pops immediately)',
    'all elements identical (decide strict vs non-strict comparison)',
    'single-element array'
  ],
  variants: 'Next greater/smaller to the right; next greater/smaller to the left (iterate right-to-left); largest rectangle in histogram (stack of indices with area computed on pop); stock span / trapping rain water style running comparisons.',
  interviewFollowUps: [
    'Can you prove the amortized O(n) bound — why doesn\'t each element get pushed/popped more than once?',
    'How would you adapt this to find the next smaller element instead?',
    'What changes if the array is circular?'
  ],
  relatedPatterns: [
    'monotonic-deque',
    'sorting-greedy'
  ],
  difficultyToLearn: 4,
  frequencyScore: 4
};

export const MONOTONIC_STACK_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '496',
    title: 'Next Greater Element I',
    url: 'https://leetcode.com/problems/next-greater-element-i/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '739',
    title: 'Daily Temperatures',
    url: 'https://leetcode.com/problems/daily-temperatures/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '84',
    title: 'Largest Rectangle in Histogram',
    url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
  {
    leetcodeId: '42',
    title: 'Trapping Rain Water',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
    difficulty: 'Hard',
    role: 'VARIANT',
    orderIndex: 4
  },
];
