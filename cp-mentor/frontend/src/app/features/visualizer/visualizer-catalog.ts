import { VisualizerDef } from './model';
import { generateLinearSearchTrace, LinearSearchInput } from './traces/linear-search.trace';
import { generateArrayRotateTrace, ArrayRotateInput } from './traces/array.trace';
import { generateTwoPointerTrace, generateSlidingWindowTrace, generateContainerWaterTrace, TwoSumSortedInput, SlidingWindowInput, ContainerWaterInput } from './traces/two-pointer-window.trace';
import { generateDutchFlagTrace, DutchFlagInput } from './traces/dutch-flag.trace';
import { generateAnagramTrace, AnagramInput } from './traces/string.trace';
import { generateMonotonicStackTrace, NextGreaterInput } from './traces/monotonic-stack.trace';
import { generatePrefixSumTrace, PrefixSumInput } from './traces/prefix-sum.trace';
import { generateFastSlowTrace, LinkedListCycleInput } from './traces/linked-list.trace';
import { generateTreeDfsTrace, TreeInput } from './traces/tree.trace';
import { generateTrieTrace, TrieInput } from './traces/trie.trace';
import { generateGraphBfsTrace, GraphInput } from './traces/graph.trace';
import { generateDpTableTrace, ClimbStairsInput } from './traces/dp-table.trace';
import { generateSelectionSortTrace, generateMergeSortTrace, generateQuickSortTrace, SortInput } from './traces/sorting.trace';

function parseNumberList(raw: string): number[] {
  return raw.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
}

export const VISUALIZER_CATALOG: VisualizerDef[] = [
  {
    slug: 'linear-search',
    title: 'Linear Search',
    structure: 'array',
    description: 'The engine\'s own proof-of-life trace — scan left to right for a target.',
    presets: [
      { label: 'Found midway', input: { values: [4, 2, 9, 6, 1, 7], target: 6 } as LinearSearchInput },
      { label: 'Not present', input: { values: [3, 8, 5, 2], target: 99 } as LinearSearchInput },
    ],
    customInputLabel: 'Comma-separated values, then target (e.g. "3,8,5,2 | 5")',
    parseCustomInput: (raw: string): LinearSearchInput => {
      const [v, t] = raw.split('|');
      return { values: parseNumberList(v ?? ''), target: Number((t ?? '').trim()) };
    },
    generate: generateLinearSearchTrace,
  },
  {
    slug: 'array-rotation',
    title: 'Array Rotation (three reverses)',
    structure: 'array',
    description: 'Rotate an array in place with O(1) extra space using three reversals.',
    presets: [
      { label: 'Rotate by 2', input: { values: [1, 2, 3, 4, 5, 6, 7], k: 2 } as ArrayRotateInput },
      { label: 'Rotate by 3', input: { values: [10, 20, 30, 40, 50], k: 3 } as ArrayRotateInput },
    ],
    customInputLabel: 'Comma-separated values, then k (e.g. "1,2,3,4,5 | 2")',
    parseCustomInput: (raw: string): ArrayRotateInput => {
      const [v, k] = raw.split('|');
      return { values: parseNumberList(v ?? ''), k: Number((k ?? '').trim()) };
    },
    generate: generateArrayRotateTrace,
  },
  {
    slug: 'two-pointer-sum',
    title: 'Two Pointer — Pair Sum',
    patternSlug: 'two-pointer',
    structure: 'array',
    description: 'Converging left/right pointers on a sorted array — the highest-frequency interview pattern.',
    presets: [
      { label: 'Match found', input: { values: [2, 4, 7, 9, 11, 15], target: 16 } as TwoSumSortedInput },
      { label: 'No match', input: { values: [1, 3, 5, 7], target: 100 } as TwoSumSortedInput },
    ],
    customInputLabel: 'Sorted values, then target (e.g. "2,4,7,9,11 | 16")',
    parseCustomInput: (raw: string): TwoSumSortedInput => {
      const [v, t] = raw.split('|');
      return { values: parseNumberList(v ?? '').sort((a, b) => a - b), target: Number((t ?? '').trim()) };
    },
    generate: generateTwoPointerTrace,
  },
  {
    slug: 'container-with-most-water',
    title: 'Container With Most Water',
    patternSlug: 'two-pointer',
    structure: 'array',
    description: 'Converging two pointer, but the invariant is "the shorter wall is the bottleneck" — different reasoning from a sorted-pair-sum problem, same technique.',
    presets: [
      { label: 'Classic', input: { heights: [1, 8, 6, 2, 5, 4, 8, 3, 7] } as ContainerWaterInput },
      { label: 'Increasing', input: { heights: [1, 2, 3, 4, 5, 6] } as ContainerWaterInput },
    ],
    customInputLabel: 'Comma-separated heights (e.g. "1,8,6,2,5,4,8,3,7")',
    parseCustomInput: (raw: string): ContainerWaterInput => ({ heights: parseNumberList(raw) }),
    generate: generateContainerWaterTrace,
  },
  {
    slug: 'sliding-window-unique',
    title: 'Sliding Window — Longest Unique Substring',
    patternSlug: 'sliding-window-variable',
    structure: 'array',
    description: 'Grow the window with right, shrink it from the left the moment a repeat appears.',
    presets: [
      { label: '"abcabcbb"', input: { text: 'abcabcbb' } as SlidingWindowInput },
      { label: '"pwwkew"', input: { text: 'pwwkew' } as SlidingWindowInput },
    ],
    customInputLabel: 'Any string',
    parseCustomInput: (raw: string): SlidingWindowInput => ({ text: raw.trim() }),
    generate: generateSlidingWindowTrace,
  },
  {
    slug: 'dutch-national-flag',
    title: 'Dutch National Flag (Sort Colors)',
    structure: 'array',
    description: 'Three-way partition of 0/1/2 with low/mid/high pointers — the mid-doesn\'t-advance invariant.',
    presets: [
      { label: 'Mixed', input: { values: [2, 0, 1, 2, 1, 0, 0, 2] } as DutchFlagInput },
      { label: 'Already sorted', input: { values: [0, 0, 1, 1, 2, 2] } as DutchFlagInput },
    ],
    customInputLabel: 'Values 0/1/2 only (e.g. "2,0,1,2,1,0")',
    parseCustomInput: (raw: string): DutchFlagInput => ({ values: parseNumberList(raw).filter(n => n >= 0 && n <= 2) }),
    generate: generateDutchFlagTrace,
  },
  {
    slug: 'anagram-check',
    title: 'Anagram Check — Frequency Array',
    patternSlug: 'hashing-frequency',
    structure: 'array',
    description: '26-slot letter counter fills from one string, drains from the other.',
    presets: [
      { label: '"listen" / "silent"', input: { a: 'listen', b: 'silent' } as AnagramInput },
      { label: '"rat" / "car"', input: { a: 'rat', b: 'car' } as AnagramInput },
    ],
    customInputLabel: 'Two lowercase words (e.g. "listen | silent")',
    parseCustomInput: (raw: string): AnagramInput => {
      const [a, b] = raw.split('|');
      return { a: (a ?? '').trim(), b: (b ?? '').trim() };
    },
    generate: generateAnagramTrace,
  },
  {
    slug: 'monotonic-stack-next-greater',
    title: 'Monotonic Stack — Next Greater Element',
    patternSlug: 'monotonic-stack',
    structure: 'stack',
    description: 'Push/pop counters make the O(n) amortised argument visible.',
    presets: [
      { label: 'Typical', input: { values: [2, 1, 2, 4, 3, 1] } as NextGreaterInput },
      { label: 'Decreasing', input: { values: [5, 4, 3, 2, 1] } as NextGreaterInput },
    ],
    customInputLabel: 'Comma-separated values',
    parseCustomInput: (raw: string): NextGreaterInput => ({ values: parseNumberList(raw) }),
    generate: generateMonotonicStackTrace,
  },
  {
    slug: 'prefix-sum-range-query',
    title: 'Prefix Sum — Range Query',
    patternSlug: 'prefix-sum',
    structure: 'array',
    description: 'Build once, query in O(1): range sum = prefix[r+1] − prefix[l].',
    presets: [
      { label: 'Query [1,3]', input: { values: [3, 1, 4, 1, 5, 9, 2, 6], queryL: 1, queryR: 3 } as PrefixSumInput },
      { label: 'Query [0,7]', input: { values: [3, 1, 4, 1, 5, 9, 2, 6], queryL: 0, queryR: 7 } as PrefixSumInput },
    ],
    customInputLabel: 'Values, then l,r (e.g. "3,1,4,1,5 | 1,3")',
    parseCustomInput: (raw: string): PrefixSumInput => {
      const [v, range] = raw.split('|');
      const [l, r] = (range ?? '').split(',').map(s => Number(s.trim()));
      return { values: parseNumberList(v ?? ''), queryL: l ?? 0, queryR: r ?? 0 };
    },
    generate: generatePrefixSumTrace,
  },
  {
    slug: 'linked-list-cycle',
    title: 'Linked List — Fast/Slow Cycle Detection',
    patternSlug: 'linked-list-fast-slow',
    structure: 'linked-list',
    description: 'Floyd\'s cycle detection: fast laps slow if and only if there\'s a cycle.',
    presets: [
      { label: 'Has a cycle', input: { values: [3, 2, 0, -4], cyclePos: 1 } as LinkedListCycleInput },
      { label: 'No cycle', input: { values: [1, 2, 3, 4], cyclePos: -1 } as LinkedListCycleInput },
    ],
    customInputLabel: 'Values, then the 0-based index the last node cycles back to, or -1 (e.g. "1,2,3,4 | 1")',
    parseCustomInput: (raw: string): LinkedListCycleInput => {
      const [v, c] = raw.split('|');
      return { values: parseNumberList(v ?? ''), cyclePos: Number((c ?? '-1').trim()) };
    },
    generate: generateFastSlowTrace,
  },
  {
    slug: 'tree-inorder-dfs',
    title: 'Binary Tree — In-order DFS',
    patternSlug: 'tree-dfs',
    structure: 'tree',
    description: 'Visit left, then node, then right. The call stack in the rail is what makes it depth-first.',
    presets: [
      { label: 'Balanced', input: { levelOrder: [5, 3, 8, 1, 4, 7, 9] } as TreeInput },
      { label: 'Skewed', input: { levelOrder: [1, 2, null, 3, null, null, null, 4] } as TreeInput },
    ],
    customInputLabel: 'Level-order values, "null" for gaps (e.g. "5,3,8,1,4,null,9")',
    parseCustomInput: (raw: string): TreeInput => ({
      levelOrder: raw.split(',').map(s => s.trim()).map(s => (s === 'null' || s === '' ? null : Number(s))),
    }),
    generate: generateTreeDfsTrace,
  },
  {
    slug: 'trie-insert-search',
    title: 'Trie — Insert & Search',
    patternSlug: 'trie',
    structure: 'trie',
    description: '"car" then "card" shares a branch — inserting a common prefix twice costs nothing extra.',
    presets: [
      { label: '"car" then "card"', input: { insertWords: ['car', 'card'], searchWord: 'car' } as TrieInput },
      { label: 'Prefix-only search', input: { insertWords: ['apple', 'app'], searchWord: 'ap' } as TrieInput },
    ],
    customInputLabel: 'Words to insert, then the word to search (e.g. "car,card | car")',
    parseCustomInput: (raw: string): TrieInput => {
      const [words, search] = raw.split('|');
      return { insertWords: (words ?? '').split(',').map(w => w.trim()).filter(Boolean), searchWord: (search ?? '').trim() };
    },
    generate: generateTrieTrace,
  },
  {
    slug: 'graph-bfs-wave',
    title: 'Graph — BFS Wave',
    patternSlug: 'graph-bfs-dfs',
    structure: 'graph',
    description: 'BFS expands in waves by distance — everything at distance d is visited before d+1.',
    presets: [
      {
        label: 'Small grid graph',
        input: {
          nodes: [
            { id: 'A', x: 0, y: 0 }, { id: 'B', x: 120, y: -60 }, { id: 'C', x: 120, y: 60 },
            { id: 'D', x: 240, y: -60 }, { id: 'E', x: 240, y: 60 }, { id: 'F', x: 360, y: 0 },
          ],
          edges: [{ from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'B', to: 'D' }, { from: 'C', to: 'E' }, { from: 'D', to: 'F' }, { from: 'E', to: 'F' }],
          startId: 'A',
        } as GraphInput,
      },
    ],
    customInputLabel: 'Preset-only for now — custom graph layouts aren\'t parseable from a single text field yet.',
    parseCustomInput: (): GraphInput => { throw new Error('custom input not supported'); },
    generate: generateGraphBfsTrace,
  },
  {
    slug: 'dp-climbing-stairs',
    title: 'DP Table — Climbing Stairs (bottom-up)',
    patternSlug: 'dp-1d',
    structure: 'grid',
    description: 'Each cell is built from already-solved smaller subproblems — arrows show the dependency.',
    presets: [
      { label: 'n = 6', input: { n: 6 } as ClimbStairsInput },
      { label: 'n = 10', input: { n: 10 } as ClimbStairsInput },
    ],
    customInputLabel: 'A single integer n (2-15)',
    parseCustomInput: (raw: string): ClimbStairsInput => ({ n: Math.min(Math.max(Number(raw.trim()) || 6, 2), 15) }),
    generate: generateDpTableTrace,
  },
  {
    slug: 'selection-sort',
    title: 'Selection Sort',
    patternSlug: 'sorting-greedy',
    structure: 'array',
    description: 'Repeatedly select the minimum of the unsorted suffix and swap it into place.',
    presets: [
      { label: 'Random order', input: { values: [64, 25, 12, 22, 11] } as SortInput },
      { label: 'Reverse sorted', input: { values: [9, 7, 5, 3, 1] } as SortInput },
    ],
    customInputLabel: 'Comma-separated values',
    parseCustomInput: (raw: string): SortInput => ({ values: parseNumberList(raw) }),
    generate: generateSelectionSortTrace,
  },
  {
    slug: 'merge-sort',
    title: 'Merge Sort',
    patternSlug: 'sorting-greedy',
    structure: 'array',
    description: 'Split recursively down to single elements, then merge sorted halves back together — the recursion tree is visible in the split/merge frame pairs.',
    presets: [
      { label: 'Random order', input: { values: [38, 27, 43, 3, 9, 82, 10] } as SortInput },
      { label: 'Reverse sorted', input: { values: [9, 7, 5, 3, 1] } as SortInput },
    ],
    customInputLabel: 'Comma-separated values',
    parseCustomInput: (raw: string): SortInput => ({ values: parseNumberList(raw) }),
    generate: generateMergeSortTrace,
  },
  {
    slug: 'quick-sort',
    title: 'Quick Sort (Lomuto partition)',
    patternSlug: 'sorting-greedy',
    structure: 'array',
    description: 'Pick a pivot, partition everything smaller to its left and larger to its right, recurse — watch the pivot land in its final position each call.',
    presets: [
      { label: 'Random order', input: { values: [64, 25, 12, 22, 11, 90] } as SortInput },
      { label: 'Already sorted (worst case)', input: { values: [1, 2, 3, 4, 5] } as SortInput },
    ],
    customInputLabel: 'Comma-separated values',
    parseCustomInput: (raw: string): SortInput => ({ values: parseNumberList(raw) }),
    generate: generateQuickSortTrace,
  },
];

export function findVisualizer(slug: string): VisualizerDef | undefined {
  return VISUALIZER_CATALOG.find(v => v.slug === slug);
}
