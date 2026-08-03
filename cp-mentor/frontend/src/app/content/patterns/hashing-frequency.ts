// Fetched from the live, seeded backend (GET /api/v1/method/patterns/hashing-frequency and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const HASHING_FREQUENCY: Pattern = {
  slug: 'hashing-frequency',
  name: 'Hashing & Frequency Counting',
  category: 'ARRAY',
  intuition: 'Trade memory for speed by storing a count or last-seen-index of every element in a hash map, turning \'have I seen this before, and how many times\' into an O(1) lookup instead of an O(n) rescan — like a coat-check ticket for every item you\'ve already looked at.',
  recognitionTriggers: [
    'find duplicates',
    'anagram check',
    'count occurrences',
    'first unique character',
    'two sum (unsorted)'
  ],
  antiTriggers: [
    'order/position matters and can\'t be recovered from a count map alone',
    'input is sorted and two-pointer would be simpler with O(1) space'
  ],
  javaTemplate: 'Map<Integer, Integer> seen = new HashMap<>();\nfor (int i = 0; i < nums.length; i++) {\n    int need = target - nums[i];\n    if (seen.containsKey(need)) return new int[]{seen.get(need), i};\n    seen.put(nums[i], i);\n}',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  whyComplexityIsNotObvious: 'It looks like it should still be O(n^2) because you\'re \'checking against everything seen so far\', but a hash map makes that check O(1) amortized, so n checks total stay O(n) — the complexity win is entirely in swapping a linear scan for a hash lookup.',
  commonMistakes: [
    'Using the wrong hash key granularity for anagrams (sorted string vs 26-length count array — count array is faster)',
    'Not handling hash collisions/mutable keys correctly for custom objects',
    'Forgetting HashMap iteration order is not insertion order (use LinkedHashMap if order matters)'
  ],
  edgeCaseChecklist: [
    'empty input',
    'all elements identical',
    'no valid answer exists',
    'negative numbers or zero as keys'
  ],
  variants: 'Frequency counting (count array for bounded alphabets, hashmap for unbounded); index/last-seen tracking; grouping by a derived key (e.g. sorted string for anagram groups).',
  interviewFollowUps: [
    'What if the input alphabet is bounded (e.g. lowercase letters only) — can you use an array instead of a hashmap?',
    'How would you handle this with limited memory / streaming input?',
    'What\'s the tradeoff between a hashmap and sorting first?'
  ],
  relatedPatterns: [
    'sliding-window-variable',
    'sorting-greedy'
  ],
  difficultyToLearn: 1,
  frequencyScore: 5
};

export const HASHING_FREQUENCY_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '1',
    title: 'Two Sum',
    url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '49',
    title: 'Group Anagrams',
    url: 'https://leetcode.com/problems/group-anagrams/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '128',
    title: 'Longest Consecutive Sequence',
    url: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    difficulty: 'Medium',
    role: 'HARD',
    orderIndex: 3
  },
];
