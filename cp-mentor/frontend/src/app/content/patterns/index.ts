export * from './types';

export { DP_1D, DP_1D_PROBLEMS } from './dp-1d';
export { DP_2D, DP_2D_PROBLEMS } from './dp-2d';
export { RECURSION_BACKTRACKING, RECURSION_BACKTRACKING_PROBLEMS } from './recursion-backtracking';
export { BINARY_SEARCH_ARRAY, BINARY_SEARCH_ARRAY_PROBLEMS } from './binary-search-array';
export { BINARY_SEARCH_ANSWER, BINARY_SEARCH_ANSWER_PROBLEMS } from './binary-search-answer';
export { BIT_MANIPULATION, BIT_MANIPULATION_PROBLEMS } from './bit-manipulation';
export { BST_PROPERTIES, BST_PROPERTIES_PROBLEMS } from './bst-properties';
export { GRAPH_BFS_DFS, GRAPH_BFS_DFS_PROBLEMS } from './graph-bfs-dfs';
export { HASHING_FREQUENCY, HASHING_FREQUENCY_PROBLEMS } from './hashing-frequency';
export { HEAP_TOP_K, HEAP_TOP_K_PROBLEMS } from './heap-top-k';
export { INTERVALS, INTERVALS_PROBLEMS } from './intervals';
export { LINKED_LIST_FAST_SLOW, LINKED_LIST_FAST_SLOW_PROBLEMS } from './linked-list-fast-slow';
export { MONOTONIC_DEQUE, MONOTONIC_DEQUE_PROBLEMS } from './monotonic-deque';
export { MONOTONIC_STACK, MONOTONIC_STACK_PROBLEMS } from './monotonic-stack';
export { PREFIX_SUM, PREFIX_SUM_PROBLEMS } from './prefix-sum';
export { SLIDING_WINDOW_FIXED, SLIDING_WINDOW_FIXED_PROBLEMS } from './sliding-window-fixed';
export { SLIDING_WINDOW_VARIABLE, SLIDING_WINDOW_VARIABLE_PROBLEMS } from './sliding-window-variable';
export { SORTING_GREEDY, SORTING_GREEDY_PROBLEMS } from './sorting-greedy';
export { TOPOLOGICAL_SORT, TOPOLOGICAL_SORT_PROBLEMS } from './topological-sort';
export { TREE_BFS, TREE_BFS_PROBLEMS } from './tree-bfs';
export { TREE_DFS, TREE_DFS_PROBLEMS } from './tree-dfs';
export { TRIE, TRIE_PROBLEMS } from './trie';
export { TWO_POINTER, TWO_POINTER_PROBLEMS } from './two-pointer';
export { UNION_FIND, UNION_FIND_PROBLEMS } from './union-find';
export { SHORTEST_PATH, SHORTEST_PATH_PROBLEMS } from './shortest-path';

import { Pattern, PatternProblemRef } from './types';
import { DP_1D, DP_1D_PROBLEMS } from './dp-1d';
import { DP_2D, DP_2D_PROBLEMS } from './dp-2d';
import { RECURSION_BACKTRACKING, RECURSION_BACKTRACKING_PROBLEMS } from './recursion-backtracking';
import { BINARY_SEARCH_ARRAY, BINARY_SEARCH_ARRAY_PROBLEMS } from './binary-search-array';
import { BINARY_SEARCH_ANSWER, BINARY_SEARCH_ANSWER_PROBLEMS } from './binary-search-answer';
import { BIT_MANIPULATION, BIT_MANIPULATION_PROBLEMS } from './bit-manipulation';
import { BST_PROPERTIES, BST_PROPERTIES_PROBLEMS } from './bst-properties';
import { GRAPH_BFS_DFS, GRAPH_BFS_DFS_PROBLEMS } from './graph-bfs-dfs';
import { HASHING_FREQUENCY, HASHING_FREQUENCY_PROBLEMS } from './hashing-frequency';
import { HEAP_TOP_K, HEAP_TOP_K_PROBLEMS } from './heap-top-k';
import { INTERVALS, INTERVALS_PROBLEMS } from './intervals';
import { LINKED_LIST_FAST_SLOW, LINKED_LIST_FAST_SLOW_PROBLEMS } from './linked-list-fast-slow';
import { MONOTONIC_DEQUE, MONOTONIC_DEQUE_PROBLEMS } from './monotonic-deque';
import { MONOTONIC_STACK, MONOTONIC_STACK_PROBLEMS } from './monotonic-stack';
import { PREFIX_SUM, PREFIX_SUM_PROBLEMS } from './prefix-sum';
import { SLIDING_WINDOW_FIXED, SLIDING_WINDOW_FIXED_PROBLEMS } from './sliding-window-fixed';
import { SLIDING_WINDOW_VARIABLE, SLIDING_WINDOW_VARIABLE_PROBLEMS } from './sliding-window-variable';
import { SORTING_GREEDY, SORTING_GREEDY_PROBLEMS } from './sorting-greedy';
import { TOPOLOGICAL_SORT, TOPOLOGICAL_SORT_PROBLEMS } from './topological-sort';
import { TREE_BFS, TREE_BFS_PROBLEMS } from './tree-bfs';
import { TREE_DFS, TREE_DFS_PROBLEMS } from './tree-dfs';
import { TRIE, TRIE_PROBLEMS } from './trie';
import { TWO_POINTER, TWO_POINTER_PROBLEMS } from './two-pointer';
import { UNION_FIND, UNION_FIND_PROBLEMS } from './union-find';
import { SHORTEST_PATH, SHORTEST_PATH_PROBLEMS } from './shortest-path';

export const PATTERNS: Pattern[] = [
  DP_1D,
  DP_2D,
  RECURSION_BACKTRACKING,
  BINARY_SEARCH_ARRAY,
  BINARY_SEARCH_ANSWER,
  BIT_MANIPULATION,
  BST_PROPERTIES,
  GRAPH_BFS_DFS,
  HASHING_FREQUENCY,
  HEAP_TOP_K,
  INTERVALS,
  LINKED_LIST_FAST_SLOW,
  MONOTONIC_DEQUE,
  MONOTONIC_STACK,
  PREFIX_SUM,
  SLIDING_WINDOW_FIXED,
  SLIDING_WINDOW_VARIABLE,
  SORTING_GREEDY,
  TOPOLOGICAL_SORT,
  TREE_BFS,
  TREE_DFS,
  TRIE,
  TWO_POINTER,
  UNION_FIND,
  SHORTEST_PATH,
];

export const PATTERN_PROBLEMS_BY_SLUG: Record<string, PatternProblemRef[]> = {
  'dp-1d': DP_1D_PROBLEMS,
  'dp-2d': DP_2D_PROBLEMS,
  'recursion-backtracking': RECURSION_BACKTRACKING_PROBLEMS,
  'binary-search-array': BINARY_SEARCH_ARRAY_PROBLEMS,
  'binary-search-answer': BINARY_SEARCH_ANSWER_PROBLEMS,
  'bit-manipulation': BIT_MANIPULATION_PROBLEMS,
  'bst-properties': BST_PROPERTIES_PROBLEMS,
  'graph-bfs-dfs': GRAPH_BFS_DFS_PROBLEMS,
  'hashing-frequency': HASHING_FREQUENCY_PROBLEMS,
  'heap-top-k': HEAP_TOP_K_PROBLEMS,
  'intervals': INTERVALS_PROBLEMS,
  'linked-list-fast-slow': LINKED_LIST_FAST_SLOW_PROBLEMS,
  'monotonic-deque': MONOTONIC_DEQUE_PROBLEMS,
  'monotonic-stack': MONOTONIC_STACK_PROBLEMS,
  'prefix-sum': PREFIX_SUM_PROBLEMS,
  'sliding-window-fixed': SLIDING_WINDOW_FIXED_PROBLEMS,
  'sliding-window-variable': SLIDING_WINDOW_VARIABLE_PROBLEMS,
  'sorting-greedy': SORTING_GREEDY_PROBLEMS,
  'topological-sort': TOPOLOGICAL_SORT_PROBLEMS,
  'tree-bfs': TREE_BFS_PROBLEMS,
  'tree-dfs': TREE_DFS_PROBLEMS,
  'trie': TRIE_PROBLEMS,
  'two-pointer': TWO_POINTER_PROBLEMS,
  'union-find': UNION_FIND_PROBLEMS,
  'shortest-path': SHORTEST_PATH_PROBLEMS,
};

export function getPattern(slug: string): Pattern | undefined {
  return PATTERNS.find(p => p.slug === slug);
}
