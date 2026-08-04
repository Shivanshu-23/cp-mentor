// Source: "How to Analyse and Approach a DSA Problem", Phase 3 — Name the Bottleneck, Run the Five Moves.

export const BOTTLENECK_QUESTION = 'What am I recomputing?';

export const BOTTLENECK_GUIDANCE = {
  instruction: 'Answer it precisely, not vaguely.',
  vagueExample: 'the maximums.',
  preciseExample:
    'when I move from index i to i+1, I re-scan almost the identical left portion of the array ' +
    'to find a value I already computed one step ago.',
  closing: 'The precise version basically names its own fix.',
  checklistIntro:
    'Then run this checklist explicitly. Around 90% of mediums fall to one of these five.'
};

export interface RelatedPattern {
  slug: string;
  name: string;
}

export interface OptimizationMove {
  id: 'STORE_INSTEAD_OF_RECOMPUTE' | 'MONOTONIC_POINTER' | 'SORT_FIRST' | 'ONLY_EXTREME_MATTERS' | 'BINARY_SEARCH_ANSWER';
  number: 1 | 2 | 3 | 4 | 5;
  title: string;
  revealingQuestion: string;
  techniques: string[];
  exampleProblems: string[];
  triggerPhrase: string;
  warning?: string;
  relatedPatterns: RelatedPattern[];
}

export const MOVES: OptimizationMove[] = [
  {
    id: 'STORE_INSTEAD_OF_RECOMPUTE',
    number: 1,
    title: 'Store instead of recompute',
    revealingQuestion: 'The value you need was already computed; save it.',
    techniques: ['hash map', 'prefix sum', 'prefix/suffix arrays', 'memoisation', 'frequency counts'],
    exampleProblems: [
      'Two Sum',
      'Subarray Sum Equals K',
      'Product of Array Except Self',
      'Trapping Rain Water',
      'Longest Consecutive Sequence',
      'every top-down DP'
    ],
    triggerPhrase: 'I keep re-scanning the same region.',
    relatedPatterns: [
      { slug: 'hashing-frequency', name: 'Hashing & Frequency Counting' },
      { slug: 'prefix-sum', name: 'Prefix Sum' },
      { slug: 'dp-1d', name: '1D Dynamic Programming' }
    ]
  },
  {
    id: 'MONOTONIC_POINTER',
    number: 2,
    title: 'A pointer or window never needs to move backwards',
    revealingQuestion:
      'If expanding the window can only ever help and shrinking is monotonic, you get O(n) ' +
      'instead of O(n²).',
    techniques: ['two pointer', 'sliding window (fixed and variable)', 'fast/slow pointer'],
    exampleProblems: [
      'Longest Substring Without Repeating Characters',
      'Minimum Window Substring',
      'Container With Most Water',
      'Remove Duplicates',
      'Linked List Cycle'
    ],
    triggerPhrase: '"contiguous subarray/substring" plus "longest / shortest / at most K."',
    relatedPatterns: [
      { slug: 'two-pointer', name: 'Two Pointer' },
      { slug: 'sliding-window-fixed', name: 'Sliding Window (Fixed Size)' },
      { slug: 'sliding-window-variable', name: 'Sliding Window (Variable Size)' }
    ]
  },
  {
    id: 'SORT_FIRST',
    number: 3,
    title: 'Sort first, then the structure becomes exploitable',
    revealingQuestion:
      'Sorting costs O(n log n) but often turns an O(n²) search into an O(n) sweep.',
    techniques: ['greedy after sort', 'two pointer on sorted array', 'sweep line', 'interval merging'],
    exampleProblems: [
      'Merge Intervals',
      '3Sum',
      'Meeting Rooms II',
      'Non-overlapping Intervals',
      'Minimum Number of Arrows'
    ],
    triggerPhrase: '',
    warning: 'sorting destroys original indices. If the answer requires indices, store pairs or use a different move.',
    relatedPatterns: [
      { slug: 'sorting-greedy', name: 'Sort Then Greedy' },
      { slug: 'intervals', name: 'Interval Scheduling & Merging' }
    ]
  },
  {
    id: 'ONLY_EXTREME_MATTERS',
    number: 4,
    title: 'Only the max/min matters, not the whole set',
    revealingQuestion: 'You are carrying a whole collection when you only ever query one end of it.',
    techniques: ['heap / PriorityQueue', 'monotonic stack', 'monotonic deque', 'running max/min variables'],
    exampleProblems: [
      'Kth Largest',
      'Merge K Sorted Lists',
      'Next Greater Element',
      'Largest Rectangle in Histogram',
      'Sliding Window Maximum',
      'Task Scheduler'
    ],
    triggerPhrase: '"next greater / previous smaller" → monotonic stack. "top K" or "K-th" → heap.',
    relatedPatterns: [
      { slug: 'heap-top-k', name: 'Heap for Top-K' },
      { slug: 'monotonic-stack', name: 'Monotonic Stack' },
      { slug: 'monotonic-deque', name: 'Monotonic Deque' }
    ]
  },
  {
    id: 'BINARY_SEARCH_ANSWER',
    number: 5,
    title: 'The answer is monotonic in some parameter',
    revealingQuestion:
      'If "can I achieve X?" is easy to check, and being able to achieve X implies being able ' +
      'to achieve X+1, binary search the answer.',
    techniques: ['binary search on answer space, not on the array'],
    exampleProblems: [
      'Koko Eating Bananas',
      'Split Array Largest Sum',
      'Capacity to Ship Packages',
      'Minimise Max Distance to Gas Station',
      'Median of Two Sorted Arrays'
    ],
    triggerPhrase: '"minimise the maximum" or "maximise the minimum." These two phrases are almost a guarantee.',
    relatedPatterns: [
      { slug: 'binary-search-answer', name: 'Binary Search on the Answer' }
    ]
  }
];

export interface BeyondTheFiveFallback {
  question: string;
  answer: string;
}

export const BEYOND_THE_FIVE: BeyondTheFiveFallback[] = [
  {
    question: 'Does the problem have overlapping subproblems and optimal substructure?',
    answer:
      '→ DP. Then define the state as a sentence: "dp[i][j] = the best answer considering the ' +
      'first i items with j capacity remaining." Never write DP code before you can say that ' +
      'sentence.'
  },
  {
    question: 'Are there entities and relationships?',
    answer:
      '→ graph. Then decide: shortest path (BFS/Dijkstra), connectivity (DSU/DFS), ordering ' +
      '(topological sort), or cycle detection.'
  },
  {
    question: 'Does a local greedy choice provably never hurt?',
    answer: '→ greedy. You must be able to argue why, or you will fail on a counterexample.'
  },
  {
    question: 'Is it about individual bits, or n ≤ 25 with subsets?',
    answer: '→ bit manipulation.'
  }
];

export const BEYOND_THE_FIVE_INTRO = 'If none of the five fit, ask these in order:';
