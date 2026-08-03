// Fetched from the live, seeded backend (GET /api/v1/method/patterns/binary-search-array and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const BINARY_SEARCH_ARRAY: Pattern = {
  slug: 'binary-search-array',
  name: 'Binary Search on an Array',
  category: 'ARRAY',
  intuition: 'Repeatedly halve a sorted search space by comparing the midpoint to the target — like looking up a word in a paper dictionary by always flipping to the middle and discarding half the book.',
  recognitionTriggers: [
    'sorted array',
    'find target index',
    'find insertion point',
    'find first/last occurrence',
    'rotated sorted array'
  ],
  antiTriggers: [
    'array is not sorted and can\'t be sorted (would lose original indices you need)',
    'searching by a property that isn\'t monotonic across the array'
  ],
  javaTemplate: 'int lo = 0, hi = arr.length - 1;\nwhile (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n}\nreturn -1; // not found',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  whyComplexityIsNotObvious: 'Each comparison discards half the remaining search space, so the number of comparisons needed is log2(n) — it feels linear-ish to a beginner because \'searching\' usually means scanning, but halving compounds fast: a million elements takes only about 20 comparisons.',
  commonMistakes: [
    'Integer overflow from (lo + hi) / 2 instead of lo + (hi - lo) / 2',
    'Off-by-one in loop condition (< vs <=) causing infinite loops or missed elements',
    'Not handling duplicates when searching for first/last occurrence'
  ],
  edgeCaseChecklist: [
    'empty array',
    'single element array',
    'target smaller than all elements',
    'target larger than all elements',
    'duplicate values around the target'
  ],
  variants: 'Exact match search; find first/last occurrence (lower_bound/upper_bound); search in rotated sorted array; search in a 2D sorted matrix by treating it as a flattened 1D array.',
  interviewFollowUps: [
    'How would you find the first and last position of a target, not just any occurrence?',
    'How does this change if the array is rotated at an unknown pivot?',
    'Can you do this iteratively and recursively — what\'s the space tradeoff?'
  ],
  relatedPatterns: [
    'binary-search-answer',
    'two-pointer'
  ],
  difficultyToLearn: 2,
  frequencyScore: 5
};

export const BINARY_SEARCH_ARRAY_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '704',
    title: 'Binary Search',
    url: 'https://leetcode.com/problems/binary-search/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '34',
    title: 'Find First and Last Position of Element in Sorted Array',
    url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '33',
    title: 'Search in Rotated Sorted Array',
    url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    difficulty: 'Medium',
    role: 'HARD',
    orderIndex: 3
  },
];
