// Fetched from the live, seeded backend (GET /api/v1/method/patterns/linked-list-fast-slow and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const LINKED_LIST_FAST_SLOW: Pattern = {
  slug: 'linked-list-fast-slow',
  name: 'Linked List Fast & Slow Pointers',
  category: 'LINKED_LIST',
  intuition: 'Two pointers move through a linked list at different speeds (typically 1x and 2x); if there\'s a cycle the fast pointer eventually laps the slow one, and if there isn\'t, the fast pointer naturally finds the middle or the end first — like two runners on a track, where a faster runner only catches up to a slower one if the track loops.',
  recognitionTriggers: [
    'detect a cycle in a linked list',
    'find the middle of a linked list',
    'find the start of a cycle',
    'palindrome linked list'
  ],
  antiTriggers: [
    'random access is available and cheaper (arrays don\'t need this trick)',
    'you need exact positions/indices, not just relative structure'
  ],
  javaTemplate: 'ListNode slow = head, fast = head;\nwhile (fast != null && fast.next != null) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow == fast) return true; // cycle detected\n}\nreturn false; // fast reached the end, no cycle',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  whyComplexityIsNotObvious: 'It\'s not obvious the two pointers ever meet inside a cycle rather than looping past each other forever; the gap between them shrinks by exactly 1 node every step once both are inside the cycle, so they\'re guaranteed to meet within at most one cycle length — giving a clean O(n) bound, not something unbounded.',
  commonMistakes: [
    'Not checking fast.next != null before fast.next.next, causing a NullPointerException',
    'Confusing \'slow reaches the middle\' logic for even vs odd length lists',
    'Forgetting to reset one pointer to head when finding the actual cycle start node (Floyd\'s algorithm second phase)'
  ],
  edgeCaseChecklist: [
    'empty list',
    'single node list',
    'single node pointing to itself (self-loop)',
    'no cycle at all',
    'cycle that includes the entire list'
  ],
  variants: 'Cycle detection (Floyd\'s tortoise and hare); finding the middle node; finding the exact start of a cycle (reset one pointer to head after first meeting); checking if a list is a palindrome (find middle, reverse second half).',
  interviewFollowUps: [
    'How would you find the exact node where the cycle begins, not just whether one exists?',
    'Can you prove the pointers are guaranteed to meet within one cycle length?',
    'How would you detect a cycle without extra space if fast/slow weren\'t allowed?'
  ],
  relatedPatterns: [
    'recursion-backtracking'
  ],
  difficultyToLearn: 3,
  frequencyScore: 3
};

export const LINKED_LIST_FAST_SLOW_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '141',
    title: 'Linked List Cycle',
    url: 'https://leetcode.com/problems/linked-list-cycle/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '876',
    title: 'Middle of the Linked List',
    url: 'https://leetcode.com/problems/middle-of-the-linked-list/',
    difficulty: 'Easy',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '142',
    title: 'Linked List Cycle II',
    url: 'https://leetcode.com/problems/linked-list-cycle-ii/',
    difficulty: 'Medium',
    role: 'HARD',
    orderIndex: 3
  },
];
