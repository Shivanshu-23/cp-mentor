// New for the /yodh page — not from "How to Analyse and Approach a DSA Problem".
// Three concise lenses for naming a problem's family fast: input shape, the
// verb in the question, and the anti-triggers (pairs that look identical and
// aren't). Kept as bare tables, no prose padding, per the "concise info only"
// instruction — this is a lookup aid, not reading material.

export interface IdentifierRow {
  clue: string;
  reachFor: string;
}

export const LENS_1_INTRO = 'Lens 1 — What shape is the input?';

export const LENS_1_INPUT_SHAPE: IdentifierRow[] = [
  { clue: 'Array, sorted', reachFor: 'Two pointer, binary search' },
  { clue: 'Array, unsorted, order matters', reachFor: 'Prefix sum, sliding window, monotonic stack, Kadane' },
  { clue: 'Array, unsorted, order irrelevant', reachFor: 'Sort first, hashing, heap, counting' },
  { clue: 'Array, values bounded and small', reachFor: 'Frequency array, counting sort, bucket' },
  { clue: 'String', reachFor: 'Sliding window, frequency map, trie, two-string DP' },
  { clue: 'Two strings compared', reachFor: '2D DP (edit distance, LCS family)' },
  { clue: '2D grid', reachFor: 'BFS, DFS, DP on grid' },
  { clue: 'Tree', reachFor: 'DFS recursion, BFS by level' },
  { clue: 'Graph, edges, prerequisites', reachFor: 'BFS, DFS, topological sort, DSU, Dijkstra' },
  { clue: 'Intervals or pairs', reachFor: 'Sort by start or end, sweep line' },
  { clue: 'Linked list', reachFor: 'Fast/slow pointer, reversal, dummy head' },
  { clue: 'A single number, or bits', reachFor: 'Bit manipulation, maths' },
  { clue: 'No input structure — you choose a value', reachFor: 'Binary search on the answer' }
];

export const LENS_2_INTRO = 'Lens 2 — What is the question asking for?';

export const LENS_2_QUESTION_VERBS: IdentifierRow[] = [
  { clue: '"maximum" / "minimum" of something', reachFor: 'Greedy, DP, or binary search on answer' },
  { clue: '"count the number of ways"', reachFor: 'DP or combinatorics' },
  { clue: '"does there exist" / "is it possible"', reachFor: 'Greedy, DFS, DSU, or feasibility check + binary search' },
  { clue: '"return all ..."', reachFor: 'Backtracking' },
  { clue: '"K-th" / "top K"', reachFor: 'Heap, quickselect, or binary search on value' },
  { clue: '"longest/shortest contiguous"', reachFor: 'Sliding window' },
  { clue: '"longest/shortest subsequence"', reachFor: 'DP' },
  { clue: '"next greater" / "previous smaller"', reachFor: 'Monotonic stack' },
  { clue: '"in place" / "O(1) extra space"', reachFor: 'Two pointer, index encoding, reversal trick' },
  { clue: '"shortest path"', reachFor: 'BFS if unweighted, Dijkstra if weighted' },
  { clue: '"detect a cycle"', reachFor: 'DFS with colours, DSU, or fast/slow pointer' },
  { clue: '"design a class with these operations"', reachFor: 'Pick the structure from the required per-operation complexity' }
];

export const LENS_3_INTRO =
  'Lens 3 — Anti-triggers: pairs that look identical and are not. The interval sort key and the ' +
  'contiguous/subsequence distinction are the two most common family misidentifications in interviews.';

export interface AntiTriggerRow {
  looksLike: string;
  isActually: string;
  difference: string;
}

export const LENS_3_ANTI_TRIGGERS: AntiTriggerRow[] = [
  { looksLike: '"longest substring"', isActually: 'Sliding window', difference: 'Contiguous' },
  { looksLike: '"longest subsequence"', isActually: 'DP', difference: 'Not contiguous' },
  { looksLike: '"subarray sum = K", all positive', isActually: 'Sliding window', difference: 'Sum is monotonic as the window grows' },
  { looksLike: '"subarray sum = K", negatives allowed', isActually: 'Prefix sum + hash map', difference: 'Sum is not monotonic' },
  { looksLike: '"minimum window substring"', isActually: 'Sliding window', difference: 'Finding a window' },
  { looksLike: '"minimum in every window"', isActually: 'Monotonic deque', difference: 'Querying inside a window' },
  { looksLike: 'Sorted array, find a pair', isActually: 'Two pointer', difference: 'Converging search' },
  { looksLike: 'Sorted array, find an element', isActually: 'Binary search', difference: 'Halving search' },
  { looksLike: '"all permutations"', isActually: 'Backtracking', difference: 'Generating' },
  { looksLike: '"next permutation"', isActually: 'Single right-to-left scan', difference: 'Transforming, not generating' },
  { looksLike: '"merge intervals"', isActually: 'Sort by start', difference: 'Combining overlaps' },
  { looksLike: '"max non-overlapping intervals"', isActually: 'Sort by end, greedy', difference: 'Different sort key entirely' },
  { looksLike: '"combination sum", reuse allowed', isActually: 'Backtrack from the same index', difference: 'Element may repeat' },
  { looksLike: '"combinations", no reuse', isActually: 'Backtrack from i + 1', difference: 'Element used once' },
  { looksLike: 'Root-to-leaf path sum', isActually: 'Plain DFS', difference: 'Path is anchored' },
  { looksLike: 'Any-node-to-any-node path sum', isActually: 'DFS returning the best single branch', difference: 'Path may bend at a node' },
  { looksLike: '"number of islands"', isActually: 'BFS/DFS flood fill', difference: 'Static grid' },
  { looksLike: '"components after edges are added"', isActually: 'DSU', difference: 'Dynamic connectivity' },
  { looksLike: 'Top K frequent elements', isActually: 'Heap or bucket sort', difference: 'K-th by frequency' },
  { looksLike: 'K-th smallest in a sorted matrix', isActually: 'Binary search on value', difference: 'K-th by value' }
];
