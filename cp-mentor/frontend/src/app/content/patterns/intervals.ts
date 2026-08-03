// Fetched from the live, seeded backend (GET /api/v1/method/patterns/intervals and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const INTERVALS: Pattern = {
  slug: 'intervals',
  name: 'Interval Scheduling & Merging',
  category: 'GREEDY',
  intuition: 'Sort intervals by start (or end) time and sweep through once, merging or comparing only with the most recently kept interval — like laying appointments on a timeline and only ever needing to check the last one you wrote down.',
  recognitionTriggers: [
    'merge intervals',
    'overlapping meetings',
    'insert interval',
    'free time between intervals'
  ],
  antiTriggers: [
    'intervals need to be queried dynamically as they\'re added/removed (needs a balanced tree or event-based sweep-line instead)',
    'the relevant unit is discrete points, not ranges'
  ],
  javaTemplate: 'Arrays.sort(intervals, (a, b) -> a[0] - b[0]);\nList<int[]> merged = new ArrayList<>();\nfor (int[] iv : intervals) {\n    if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < iv[0]) {\n        merged.add(iv);\n    } else {\n        merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], iv[1]);\n    }\n}',
  timeComplexity: 'O(n log n) — dominated by the sort',
  spaceComplexity: 'O(n) for the output',
  whyComplexityIsNotObvious: 'The merge sweep itself is O(n) since each interval is only ever compared against the last merged one, not every previous interval — the O(n log n) is entirely the cost of sorting, which is easy to forget when focused on the sweep loop.',
  commonMistakes: [
    'Sorting by the wrong field (start vs end) for the specific problem variant',
    'Off-by-one on whether touching intervals ([1,2] and [2,3]) count as overlapping',
    'Mutating the input array\'s intervals in place when the caller doesn\'t expect that'
  ],
  edgeCaseChecklist: [
    'single interval',
    'no overlaps at all',
    'one interval fully contains another',
    'intervals touching exactly at endpoints'
  ],
  variants: 'Merge overlapping intervals; insert a new interval into a sorted non-overlapping set; find the minimum meeting rooms needed (sweep line with +1/-1 events); find the intersection of two interval lists (two-pointer over both).',
  interviewFollowUps: [
    'What if intervals need to support insertion and deletion dynamically?',
    'How would you find the minimum number of rooms needed instead of just merging?',
    'Does touching count as overlapping in this problem, and why does that change the code?'
  ],
  relatedPatterns: [
    'sorting-greedy',
    'two-pointer',
    'heap-top-k'
  ],
  difficultyToLearn: 2,
  frequencyScore: 4
};

export const INTERVALS_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '56',
    title: 'Merge Intervals',
    url: 'https://leetcode.com/problems/merge-intervals/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '57',
    title: 'Insert Interval',
    url: 'https://leetcode.com/problems/insert-interval/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '253',
    title: 'Meeting Rooms II',
    url: 'https://leetcode.com/problems/meeting-rooms-ii/',
    difficulty: 'Medium',
    role: 'HARD',
    orderIndex: 3
  },
];
