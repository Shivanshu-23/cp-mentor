// Fetched from the live, seeded backend (GET /api/v1/method/patterns/two-pointer and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const TWO_POINTER: Pattern = {
  slug: 'two-pointer',
  name: 'Two Pointer',
  category: 'ARRAY',
  intuition: 'Two indices march toward or away from each other across a sorted or partitioned structure, using the fact that moving one pointer eliminates a whole range of candidates at once — like two people searching a sorted phone book from opposite ends.',
  recognitionTriggers: [
    'sorted array',
    'pair that sums to target',
    'two ends',
    'remove duplicates in place',
    'reverse in place',
    'compare two sorted sequences'
  ],
  antiTriggers: [
    'unsorted array with no way to sort it first',
    'need all pairs, not just existence of one',
    'window size varies with a running sum (that\'s sliding window)'
  ],
  javaTemplate: 'int left = 0, right = arr.length - 1;\nwhile (left < right) {\n    int sum = arr[left] + arr[right];\n    if (sum == target) {\n        // found\n        left++; right--;\n    } else if (sum < target) {\n        left++;\n    } else {\n        right--;\n    }\n}',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  whyComplexityIsNotObvious: 'It looks like it should be O(n^2) because there are two notions of movement, but each pointer only ever moves forward/backward across the array once in total, so the two pointers together do at most 2n steps.',
  commonMistakes: [
    'Forgetting to skip duplicate values when the problem asks for unique pairs/triplets',
    'Using two pointers on an unsorted array without sorting first',
    'Off-by-one when the loop condition should be <= vs <'
  ],
  edgeCaseChecklist: [
    'array of length 0 or 1',
    'all elements identical',
    'target unreachable by any pair',
    'array already sorted vs needs sorting first'
  ],
  variants: 'Opposite-direction (converging) two pointers for pair-sum/palindrome checks; same-direction (fast/slow) two pointers for in-place array compaction (remove duplicates, move zeroes); three-pointer variants for 3Sum by fixing one index and running two-pointer on the rest.',
  interviewFollowUps: [
    'What if the array isn\'t sorted — what\'s the cost of sorting first?',
    'How would you return all pairs instead of just one?',
    'What changes if duplicates need to be counted, not skipped?'
  ],
  relatedPatterns: [
    'sliding-window-variable',
    'sorting-greedy'
  ],
  difficultyToLearn: 1,
  frequencyScore: 5
};

export const TWO_POINTER_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '167',
    title: 'Two Sum II - Input Array Is Sorted',
    url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '15',
    title: '3Sum',
    url: 'https://leetcode.com/problems/3sum/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '11',
    title: 'Container With Most Water',
    url: 'https://leetcode.com/problems/container-with-most-water/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 3
  },
  {
    leetcodeId: '42',
    title: 'Trapping Rain Water',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 4
  },
];
