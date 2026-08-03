// Fetched from the live, seeded backend (GET /api/v1/method/patterns/sorting-greedy and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const SORTING_GREEDY: Pattern = {
  slug: 'sorting-greedy',
  name: 'Sort Then Greedy',
  category: 'GREEDY',
  intuition: 'Sort first so that the locally-best choice at each step is provably part of some globally optimal solution — like paying off debts smallest-first because the order you sorted by removes any need to look back.',
  recognitionTriggers: [
    'maximize/minimize by choosing an order',
    'activity selection',
    'assign X to Y optimally',
    'sort then take greedily'
  ],
  antiTriggers: [
    'local optimal choice doesn\'t guarantee global optimum (that\'s a DP problem in greedy clothing)',
    'need to reconsider earlier choices based on later information (greedy is exactly the wrong tool)'
  ],
  javaTemplate: 'Arrays.sort(items, (a, b) -> a.key - b.key);\nint result = 0;\nfor (Item item : items) {\n    if (feasibleGivenCurrentState(item)) {\n        result++;\n        // commit to item, update state\n    }\n}',
  timeComplexity: 'O(n log n) — dominated by the sort',
  spaceComplexity: 'O(1) extra (O(n) if the sort isn\'t in place)',
  whyComplexityIsNotObvious: 'The greedy loop itself is O(n), so it\'s tempting to call the whole algorithm O(n); the sort dominates and sets the real complexity floor, and proving the greedy choice is actually optimal (an exchange argument) is the hard, non-obvious part — not the runtime.',
  commonMistakes: [
    'Assuming a greedy approach works without proving the exchange argument (many \'obvious\' greedy strategies are wrong)',
    'Sorting by the wrong key (e.g. by start time when end time is what makes the greedy proof work)',
    'Not handling ties in the sort key consistently'
  ],
  edgeCaseChecklist: [
    'empty input',
    'all items identical',
    'already sorted input',
    'greedy choice ties requiring a tiebreaker rule'
  ],
  variants: 'Interval scheduling (sort by end time); fractional knapsack (sort by value/weight ratio); Huffman-coding-style repeated greedy merges via a heap.',
  interviewFollowUps: [
    'Can you prove this greedy choice is optimal — what\'s the exchange argument?',
    'What\'s a counterexample where the obvious greedy strategy fails?',
    'How would this change if items had dependencies between them?'
  ],
  relatedPatterns: [
    'intervals',
    'heap-top-k',
    'binary-search-answer'
  ],
  difficultyToLearn: 3,
  frequencyScore: 4
};

export const SORTING_GREEDY_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '455',
    title: 'Assign Cookies',
    url: 'https://leetcode.com/problems/assign-cookies/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '435',
    title: 'Non-overlapping Intervals',
    url: 'https://leetcode.com/problems/non-overlapping-intervals/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '135',
    title: 'Candy',
    url: 'https://leetcode.com/problems/candy/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
];
