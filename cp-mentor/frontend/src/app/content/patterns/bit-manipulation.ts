// Fetched from the live, seeded backend (GET /api/v1/method/patterns/bit-manipulation and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const BIT_MANIPULATION: Pattern = {
  slug: 'bit-manipulation',
  name: 'Bit Manipulation',
  category: 'MATH',
  intuition: 'Numbers are bit patterns, and operations like XOR, AND, OR, and shifts let you encode/decode information (parity, presence, toggling) in O(1) per operation without extra memory — like using a bank of light switches where flipping the right combination communicates a whole message instantly.',
  recognitionTriggers: [
    'single number that appears once among duplicates',
    'count set bits',
    'power of two check',
    'subsets via bitmask',
    'XOR tricks'
  ],
  antiTriggers: [
    'the numbers involved don\'t have a meaningful bit-level structure for the problem (bit tricks would just obscure a simpler arithmetic solution)'
  ],
  javaTemplate: 'int result = 0;\nfor (int num : nums) result ^= num; // XOR cancels out pairs, leaves the singleton\n// Common bit ops:\nboolean isPowerOfTwo = n > 0 && (n & (n - 1)) == 0;\nint countSetBits = Integer.bitCount(n);\nint lowestSetBit = n & (-n);',
  timeComplexity: 'O(n) for scanning n numbers, O(1) per individual bit operation',
  spaceComplexity: 'O(1)',
  whyComplexityIsNotObvious: 'The non-obvious part isn\'t the runtime (it\'s usually the same O(n) as a hashmap approach) — it\'s that bit tricks replace O(n) extra space (a hashmap for counting) with O(1) space, because the arithmetic properties of XOR/AND do the \'remembering\' for you.',
  commonMistakes: [
    'Forgetting operator precedence — bitwise ops bind looser than comparison ops in Java, so a check like (n & 1 == 0) doesn\'t do what it looks like',
    'Sign-extension surprises with right shift (>> vs >>>) on negative numbers',
    'Assuming XOR tricks generalize to \'appears 3 times except one\' without adjusting the approach (needs a different bit-counting technique)'
  ],
  edgeCaseChecklist: [
    'n = 0',
    'negative numbers and two\'s complement behavior',
    'single-element input',
    'all elements identical'
  ],
  variants: 'XOR-cancellation for \'single number\' family problems; bitmask DP for subset enumeration; counting set bits (Brian Kernighan\'s algorithm); power-of-two and lowest-set-bit tricks.',
  interviewFollowUps: [
    'How would this change if every other number appeared 3 times instead of 2?',
    'Can you explain why n & (n-1) clears the lowest set bit?',
    'How would you count set bits across a huge range of numbers efficiently (0 to n)?'
  ],
  relatedPatterns: [
    'dp-1d',
    'hashing-frequency'
  ],
  difficultyToLearn: 3,
  frequencyScore: 3
};

export const BIT_MANIPULATION_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '136',
    title: 'Single Number',
    url: 'https://leetcode.com/problems/single-number/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '191',
    title: 'Number of 1 Bits',
    url: 'https://leetcode.com/problems/number-of-1-bits/',
    difficulty: 'Easy',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '137',
    title: 'Single Number II',
    url: 'https://leetcode.com/problems/single-number-ii/',
    difficulty: 'Medium',
    role: 'HARD',
    orderIndex: 3
  },
];
