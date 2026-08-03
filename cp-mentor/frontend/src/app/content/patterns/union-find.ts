// Fetched from the live, seeded backend (GET /api/v1/method/patterns/union-find and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const UNION_FIND: Pattern = {
  slug: 'union-find',
  name: 'Union-Find (Disjoint Set)',
  category: 'GRAPH',
  intuition: 'Track which set each element belongs to using a forest of parent pointers, and answer \'are these two connected\' in near-constant time by following parent pointers to a shared root — like a company org chart where you can tell if two employees share a manager chain by walking up to the top of each.',
  recognitionTriggers: [
    'number of connected components',
    'redundant connection / cycle in undirected graph',
    'accounts merge',
    'friend circles'
  ],
  antiTriggers: [
    'the graph is directed (union-find is fundamentally for undirected connectivity)',
    'you need the actual path between two nodes, not just whether they\'re connected'
  ],
  javaTemplate: 'int[] parent, rank;\nint find(int x) {\n    if (parent[x] != x) parent[x] = find(parent[x]); // path compression\n    return parent[x];\n}\nvoid union(int a, int b) {\n    int ra = find(a), rb = find(b);\n    if (ra == rb) return;\n    if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }\n    parent[rb] = ra;\n    if (rank[ra] == rank[rb]) rank[ra]++;\n}',
  timeComplexity: 'O(alpha(n)) amortized per operation (alpha is the inverse Ackermann function — effectively constant) with both path compression and union by rank',
  spaceComplexity: 'O(n) for the parent and rank arrays',
  whyComplexityIsNotObvious: 'It\'s astonishing that this is essentially O(1) per operation despite looking like a tree walk — path compression flattens the tree every time find() is called, and union by rank keeps trees shallow to begin with, and the combination of both provably bounds total cost by the inverse Ackermann function, which is under 5 for any input size that could ever exist in practice.',
  commonMistakes: [
    'Implementing find() without path compression, letting the tree degrade to a linked list over many unions',
    'Forgetting union by rank/size, causing the same degradation from the other direction',
    'Off-by-one when initializing parent[i] = i for 0-indexed vs 1-indexed node numbering'
  ],
  edgeCaseChecklist: [
    'no edges at all (every node its own component)',
    'all nodes already in one component',
    'self-loop edge (union(a, a))',
    'processing the very first edge that creates a redundant/cycle edge'
  ],
  variants: 'Basic union-find for connected components; union-find with size tracking (for \'largest component\' queries); union-find on a grid (percolation-style problems); weighted union-find storing relative relationships (e.g. equations/ratios between variables).',
  interviewFollowUps: [
    'Why does combining path compression AND union by rank matter — what breaks if you only use one?',
    'How would you track the size of each component as you go?',
    'How would you support \'undo\' of a union operation — what does that cost?'
  ],
  relatedPatterns: [
    'graph-bfs-dfs',
    'topological-sort'
  ],
  difficultyToLearn: 4,
  frequencyScore: 3
};

export const UNION_FIND_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '547',
    title: 'Number of Provinces',
    url: 'https://leetcode.com/problems/number-of-provinces/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '684',
    title: 'Redundant Connection',
    url: 'https://leetcode.com/problems/redundant-connection/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '721',
    title: 'Accounts Merge',
    url: 'https://leetcode.com/problems/accounts-merge/',
    difficulty: 'Medium',
    role: 'HARD',
    orderIndex: 3
  },
];
