// Fetched from the live, seeded backend (GET /api/v1/method/patterns/graph-bfs-dfs and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const GRAPH_BFS_DFS: Pattern = {
  slug: 'graph-bfs-dfs',
  name: 'Graph BFS/DFS Traversal',
  category: 'GRAPH',
  intuition: 'Explore a graph either level-by-level with a queue (BFS — good for shortest paths in unweighted graphs) or by diving deep down one path with a stack/recursion (DFS — good for reachability and structure) — like exploring a city either ring-by-ring outward from your location (BFS) or by picking one street and following it until it dead-ends (DFS).',
  recognitionTriggers: [
    'number of islands',
    'shortest path in unweighted graph',
    'connected components',
    'flood fill',
    'is the graph bipartite'
  ],
  antiTriggers: [
    'edges are weighted and shortest path is needed (that\'s Dijkstra, not plain BFS)',
    'the \'graph\' is actually a tree with no cycles to worry about (simpler tree DFS/BFS applies directly)'
  ],
  javaTemplate: 'Queue<Integer> queue = new LinkedList<>();\nboolean[] visited = new boolean[n];\nqueue.offer(start); visited[start] = true;\nint steps = 0;\nwhile (!queue.isEmpty()) {\n    int size = queue.size();\n    for (int i = 0; i < size; i++) {\n        int node = queue.poll();\n        if (node == target) return steps;\n        for (int neighbor : adj.get(node)) {\n            if (!visited[neighbor]) { visited[neighbor] = true; queue.offer(neighbor); }\n        }\n    }\n    steps++;\n}',
  timeComplexity: 'O(V + E) for both BFS and DFS',
  spaceComplexity: 'O(V) for the visited set plus the queue/recursion stack',
  whyComplexityIsNotObvious: 'It looks like it should depend on the number of paths explored, which can be exponential — but the visited array is what saves it: each node is enqueued/pushed exactly once and each edge is examined at most twice (once from each endpoint), bounding the total work to O(V + E) regardless of how tangled the graph is.',
  commonMistakes: [
    'Forgetting to mark a node visited at the moment it\'s enqueued (not when it\'s dequeued), causing it to be added to the queue multiple times',
    'Using DFS when BFS is required for a genuine shortest-path guarantee in an unweighted graph, or vice versa when only reachability matters',
    'Not handling disconnected components — a single BFS/DFS from one start node won\'t cover the whole graph'
  ],
  edgeCaseChecklist: [
    'disconnected graph (multiple components)',
    'graph with self-loops',
    'graph with cycles',
    'start node equals target node',
    'empty graph'
  ],
  variants: 'BFS for shortest path / minimum steps in unweighted graphs; DFS for connectivity, cycle detection, and structural exploration; multi-source BFS (start from several nodes simultaneously, e.g. rotting oranges); bidirectional BFS for faster shortest-path in large graphs.',
  interviewFollowUps: [
    'Why does BFS guarantee the shortest path in an unweighted graph but DFS doesn\'t?',
    'How would you handle a disconnected graph — do you need multiple BFS/DFS runs?',
    'How would multi-source BFS change this if there were several starting points simultaneously?'
  ],
  relatedPatterns: [
    'topological-sort',
    'union-find',
    'shortest-path',
    'tree-bfs'
  ],
  difficultyToLearn: 3,
  frequencyScore: 5
};

export const GRAPH_BFS_DFS_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '200',
    title: 'Number of Islands',
    url: 'https://leetcode.com/problems/number-of-islands/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '133',
    title: 'Clone Graph',
    url: 'https://leetcode.com/problems/clone-graph/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '994',
    title: 'Rotting Oranges',
    url: 'https://leetcode.com/problems/rotting-oranges/',
    difficulty: 'Medium',
    role: 'VARIANT',
    orderIndex: 3
  },
];
