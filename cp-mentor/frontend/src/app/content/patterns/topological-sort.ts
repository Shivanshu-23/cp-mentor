// Fetched from the live, seeded backend (GET /api/v1/method/patterns/topological-sort and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const TOPOLOGICAL_SORT: Pattern = {
  slug: 'topological-sort',
  name: 'Topological Sort',
  category: 'GRAPH',
  intuition: 'Order tasks so that every dependency comes before the task that needs it — repeatedly peel off nodes with no remaining incoming dependencies, like clearing a to-do list by only ever doing tasks whose prerequisites are already checked off.',
  recognitionTriggers: [
    'course schedule / prerequisites',
    'build order',
    'task dependencies',
    'detect a cycle in a directed graph'
  ],
  antiTriggers: [
    'the graph is undirected (topological order is only defined for DAGs)',
    'the graph has a cycle and the problem doesn\'t ask you to detect that as a failure case'
  ],
  javaTemplate: 'int[] inDegree = new int[n];\nfor (int[] edge : edges) inDegree[edge[1]]++;\nQueue<Integer> queue = new LinkedList<>();\nfor (int i = 0; i < n; i++) if (inDegree[i] == 0) queue.offer(i);\nList<Integer> order = new ArrayList<>();\nwhile (!queue.isEmpty()) {\n    int node = queue.poll();\n    order.add(node);\n    for (int neighbor : adj.get(node)) {\n        if (--inDegree[neighbor] == 0) queue.offer(neighbor);\n    }\n}\nboolean hasCycle = order.size() != n; // leftover nodes mean a cycle blocked them',
  timeComplexity: 'O(V + E)',
  spaceComplexity: 'O(V) for the in-degree array and queue',
  whyComplexityIsNotObvious: 'Cycle detection falls out of this algorithm almost for free — if the final ordering has fewer nodes than the graph has vertices, there\'s a cycle, without ever needing a separate cycle-detection pass; that dual-purpose behavior surprises people expecting to write two different algorithms.',
  commonMistakes: [
    'Forgetting to check order.size() != n as the cycle-detection signal, and assuming any output is a valid topological order',
    'Building the in-degree array from the wrong edge direction (prerequisite-to-course vs course-to-prerequisite)',
    'Using DFS-based topological sort but forgetting to reverse the postorder result'
  ],
  edgeCaseChecklist: [
    'graph with a cycle (no valid ordering exists)',
    'graph with no edges (any order is valid)',
    'disconnected graph (multiple independent DAGs)',
    'self-loop on a node (always creates a cycle)'
  ],
  variants: 'Kahn\'s algorithm (BFS with in-degree tracking, shown above); DFS-based topological sort (postorder, then reverse); finding all valid topological orderings (backtracking variant); parallel course scheduling (process each \'wave\' of zero in-degree nodes together).',
  interviewFollowUps: [
    'How do you detect a cycle using this same algorithm, without a separate pass?',
    'How would you find ALL valid topological orderings, not just one?',
    'How would this change if you needed the minimum number of \'semesters\' to complete all courses (BFS level-by-level)?'
  ],
  relatedPatterns: [
    'graph-bfs-dfs',
    'union-find'
  ],
  difficultyToLearn: 3,
  frequencyScore: 4
};

export const TOPOLOGICAL_SORT_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '207',
    title: 'Course Schedule',
    url: 'https://leetcode.com/problems/course-schedule/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '210',
    title: 'Course Schedule II',
    url: 'https://leetcode.com/problems/course-schedule-ii/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '269',
    title: 'Alien Dictionary',
    url: 'https://leetcode.com/problems/alien-dictionary/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
];
