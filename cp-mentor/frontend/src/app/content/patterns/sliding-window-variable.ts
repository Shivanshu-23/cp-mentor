// Fetched from the live, seeded backend (GET /api/v1/method/patterns/sliding-window-variable and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const SLIDING_WINDOW_VARIABLE: Pattern = {
  slug: 'sliding-window-variable',
  name: 'Sliding Window (Variable Size)',
  category: 'STRING',
  intuition: 'The window grows by pulling in elements from the right until it violates some constraint, then shrinks from the left until it\'s valid again — like an accordion that expands and contracts to always fit exactly under a rule.',
  recognitionTriggers: [
    'longest substring without repeating characters',
    'smallest subarray with sum at least X',
    'at most K distinct',
    'longest substring with condition'
  ],
  antiTriggers: [
    'window size is fixed and given upfront (that\'s fixed window)',
    'need to consider all subarrays, not just the contiguous best'
  ],
  javaTemplate: 'int left = 0, best = 0;\nMap<Character, Integer> count = new HashMap<>();\nfor (int right = 0; right < s.length(); right++) {\n    count.merge(s.charAt(right), 1, Integer::sum);\n    while (isInvalid(count)) {\n        count.merge(s.charAt(left), -1, Integer::sum);\n        left++;\n    }\n    best = Math.max(best, right - left + 1);\n}',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(k) where k is the alphabet/distinct-value size held in the window',
  whyComplexityIsNotObvious: 'left and right each only move forward across the string once over the whole run, even though there\'s a nested while loop — so total pointer movement is bounded by 2n, not n^2, despite looking like a nested loop.',
  commonMistakes: [
    'Using a nested loop that re-scans the window instead of incrementally shrinking from the left',
    'Forgetting to update the best answer at the right moment (before or after shrinking matters)',
    'Off-by-one in window length calculation (right - left + 1 vs right - left)'
  ],
  edgeCaseChecklist: [
    'empty string',
    'no window ever satisfies the condition',
    'entire string is one valid window',
    'all characters identical'
  ],
  variants: 'Longest window under a constraint (shrink only when invalid) vs shortest window satisfying a constraint (shrink as much as possible once valid); single-character-frequency windows vs multi-condition windows (e.g. at-most-2-distinct).',
  interviewFollowUps: [
    'How would you extend this to at-most-K distinct characters?',
    'What if you needed the actual substring, not just its length?',
    'How does this change for a circular array?'
  ],
  relatedPatterns: [
    'sliding-window-fixed',
    'two-pointer',
    'hashing-frequency'
  ],
  difficultyToLearn: 3,
  frequencyScore: 5
};

export const SLIDING_WINDOW_VARIABLE_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '3',
    title: 'Longest Substring Without Repeating Characters',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '209',
    title: 'Minimum Size Subarray Sum',
    url: 'https://leetcode.com/problems/minimum-size-subarray-sum/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '76',
    title: 'Minimum Window Substring',
    url: 'https://leetcode.com/problems/minimum-window-substring/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
];
