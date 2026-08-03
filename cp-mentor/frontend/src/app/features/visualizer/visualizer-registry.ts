// Deliberately separate from visualizer-catalog.ts, which imports every
// trace generator function. This file is metadata-only (no generator code),
// so pattern-detail.component (part of the EAGER AppModule bundle) can
// import it to decide "show a visualizer launcher" without pulling the
// lazy-loaded visualizer engine into the main bundle.
export interface VisualizerRegistryEntry {
  slug: string;
  title: string;
  patternSlug: string;
}

// Kept in sync with visualizer-catalog.ts's `patternSlug` fields by hand —
// duplicated rather than derived so this file never imports the heavy
// trace-generator code. If a visualizer's slug or pattern mapping changes,
// update both files.
export const VISUALIZER_REGISTRY: VisualizerRegistryEntry[] = [
  { slug: 'two-pointer-sum', title: 'Two Pointer — Pair Sum', patternSlug: 'two-pointer' },
  { slug: 'sliding-window-unique', title: 'Sliding Window — Longest Unique Substring', patternSlug: 'sliding-window-variable' },
  { slug: 'anagram-check', title: 'Anagram Check — Frequency Array', patternSlug: 'hashing-frequency' },
  { slug: 'monotonic-stack-next-greater', title: 'Monotonic Stack — Next Greater Element', patternSlug: 'monotonic-stack' },
  { slug: 'prefix-sum-range-query', title: 'Prefix Sum — Range Query', patternSlug: 'prefix-sum' },
  { slug: 'linked-list-cycle', title: 'Linked List — Fast/Slow Cycle Detection', patternSlug: 'linked-list-fast-slow' },
  { slug: 'tree-inorder-dfs', title: 'Binary Tree — In-order DFS', patternSlug: 'tree-dfs' },
  { slug: 'trie-insert-search', title: 'Trie — Insert & Search', patternSlug: 'trie' },
  { slug: 'graph-bfs-wave', title: 'Graph — BFS Wave', patternSlug: 'graph-bfs-dfs' },
  { slug: 'dp-climbing-stairs', title: 'DP Table — Climbing Stairs (bottom-up)', patternSlug: 'dp-1d' },
  { slug: 'selection-sort', title: 'Selection Sort', patternSlug: 'sorting-greedy' },
];

export function findVisualizerSlugForPattern(patternSlug: string): string | undefined {
  return VISUALIZER_REGISTRY.find(v => v.patternSlug === patternSlug)?.slug;
}
