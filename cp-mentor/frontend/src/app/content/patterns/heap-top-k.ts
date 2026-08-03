// Fetched from the live, seeded backend (GET /api/v1/method/patterns/heap-top-k and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const HEAP_TOP_K: Pattern = {
  slug: 'heap-top-k',
  name: 'Heap for Top-K',
  category: 'DESIGN',
  intuition: 'Keep a heap of size K instead of sorting everything — a min-heap of the K largest elements seen so far lets you discard the smallest of the K with one O(log K) operation whenever a bigger candidate shows up, like keeping only the top K scores on a leaderboard and bumping the lowest whenever someone beats it.',
  recognitionTriggers: [
    'kth largest/smallest',
    'top K frequent elements',
    'K closest points',
    'merge K sorted lists'
  ],
  antiTriggers: [
    'K is close to n, so sorting the whole thing is simpler and no worse asymptotically',
    'need the full sorted order, not just the top K'
  ],
  javaTemplate: 'PriorityQueue<Integer> minHeap = new PriorityQueue<>(); // min-heap keeps K largest\nfor (int num : nums) {\n    minHeap.offer(num);\n    if (minHeap.size() > k) minHeap.poll(); // evict the smallest of the current top K\n}\nreturn minHeap.peek(); // Kth largest',
  timeComplexity: 'O(n log k)',
  spaceComplexity: 'O(k)',
  whyComplexityIsNotObvious: 'It\'s tempting to reach for a full sort at O(n log n); bounding the heap to size K instead means each of the n insertions costs O(log k) not O(log n) — when k is small relative to n this is a real asymptotic win, not just a constant-factor one.',
  commonMistakes: [
    'Using a max-heap of all n elements instead of a min-heap capped at size K (defeats the whole point)',
    'Getting the heap direction backwards for \'K smallest\' vs \'K largest\'',
    'Not defining a correct Comparator for custom objects, causing silent wrong ordering'
  ],
  edgeCaseChecklist: [
    'k equal to n',
    'k = 1',
    'duplicate values at the Kth boundary',
    'empty input'
  ],
  variants: 'Kth largest/smallest via a bounded heap; top-K frequent via a frequency map plus heap; K closest points via a max-heap on distance; merging K sorted lists via a heap of list-heads.',
  interviewFollowUps: [
    'Why a min-heap for \'K largest\' and not a max-heap — walk through the eviction logic?',
    'How would you handle this as a stream where K elements must be maintained online?',
    'What\'s the tradeoff versus quickselect for a one-shot Kth-largest query?'
  ],
  relatedPatterns: [
    'sorting-greedy',
    'binary-search-answer'
  ],
  difficultyToLearn: 2,
  frequencyScore: 5
};

export const HEAP_TOP_K_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '215',
    title: 'Kth Largest Element in an Array',
    url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '347',
    title: 'Top K Frequent Elements',
    url: 'https://leetcode.com/problems/top-k-frequent-elements/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '23',
    title: 'Merge k Sorted Lists',
    url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
];
