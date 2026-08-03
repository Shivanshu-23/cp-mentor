// Fetched from the live, seeded backend (GET /api/v1/method/patterns/binary-search-answer and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const BINARY_SEARCH_ANSWER: Pattern = {
  slug: 'binary-search-answer',
  name: 'Binary Search on the Answer',
  category: 'MATH',
  intuition: 'Instead of searching for a value inside an array, binary search over the space of possible answers (e.g. 1 to 10^9) and use a feasibility check to decide which half to keep — like guessing a number where each guess tells you only \'too high\', \'too low\', or \'good enough\'.',
  recognitionTriggers: [
    'minimize the maximum',
    'maximize the minimum',
    'smallest value such that a condition holds',
    'capacity to ship packages',
    'koko eating bananas style'
  ],
  antiTriggers: [
    'the answer space isn\'t monotonic (feasibility doesn\'t flip cleanly from false to true)',
    'you actually need every valid answer, not just the extremal one'
  ],
  javaTemplate: 'int lo = minPossible, hi = maxPossible;\nwhile (lo < hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (isFeasible(mid)) hi = mid;      // mid works, try smaller\n    else lo = mid + 1;                  // mid too small, need bigger\n}\nreturn lo; // smallest feasible answer',
  timeComplexity: 'O(log(range) * cost of feasibility check)',
  spaceComplexity: 'O(1) beyond the feasibility check\'s own space',
  whyComplexityIsNotObvious: 'You\'re not searching an array at all — the \'sortedness\' is a property of the answer space (feasibility is monotonic: everything below the answer fails, everything above it works), which is the part beginners miss since there\'s no literal array being halved.',
  commonMistakes: [
    'Writing a feasibility check that isn\'t actually monotonic, breaking the binary search invariant',
    'Confusing lo/hi bounds for the answer with bounds for the input',
    'Off-by-one converging to lo vs hi depending on whether you want the smallest-true or largest-false'
  ],
  edgeCaseChecklist: [
    'only one feasible answer exists (lo == hi from the start)',
    'the entire range is feasible',
    'the entire range is infeasible',
    'feasibility check itself needs to handle overflow for large mid values'
  ],
  variants: 'Minimize-the-maximum (e.g. split array to minimize largest sum); maximize-the-minimum (e.g. maximize minimum distance between placed items); search over a real-valued answer space using a fixed number of iterations instead of exact convergence.',
  interviewFollowUps: [
    'Why is the feasibility function monotonic here — can you prove it?',
    'What\'s the time complexity of your feasibility check, and does that dominate the overall complexity?',
    'How would this change if the answer could be a floating point value?'
  ],
  relatedPatterns: [
    'binary-search-array',
    'sorting-greedy'
  ],
  difficultyToLearn: 4,
  frequencyScore: 4
};

export const BINARY_SEARCH_ANSWER_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '875',
    title: 'Koko Eating Bananas',
    url: 'https://leetcode.com/problems/koko-eating-bananas/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '1011',
    title: 'Capacity To Ship Packages Within D Days',
    url: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '410',
    title: 'Split Array Largest Sum',
    url: 'https://leetcode.com/problems/split-array-largest-sum/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
];
