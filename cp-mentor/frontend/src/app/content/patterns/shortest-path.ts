// Fetched from the live, seeded backend (GET /api/v1/method/patterns/shortest-path and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const SHORTEST_PATH: Pattern = {
  slug: 'shortest-path',
  name: 'Weighted Shortest Path (Dijkstra)',
  category: 'GRAPH',
  intuition: 'When edges have weights, plain BFS breaks because it assumes every edge costs the same; Dijkstra\'s algorithm instead always expands the closest not-yet-finalized node next, using a priority queue as a \'sorted frontier\' — like always driving to whichever unvisited city is currently cheapest to reach, and locking in that cost once you arrive.',
  recognitionTriggers: [
    'shortest path with weighted edges',
    'cheapest flights within K stops',
    'network delay time',
    'minimum cost to reach a destination'
  ],
  antiTriggers: [
    'all edges have equal weight (plain BFS is simpler and just as correct)',
    'negative edge weights are present (Dijkstra breaks — need Bellman-Ford instead)'
  ],
  javaTemplate: 'int[] dist = new int[n];\nArrays.fill(dist, Integer.MAX_VALUE);\ndist[start] = 0;\nPriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]); // [node, distance]\npq.offer(new int[]{start, 0});\nwhile (!pq.isEmpty()) {\n    int[] cur = pq.poll();\n    int node = cur[0], d = cur[1];\n    if (d > dist[node]) continue; // stale entry, skip\n    for (int[] edge : adj.get(node)) {\n        int next = edge[0], weight = edge[1];\n        if (dist[node] + weight < dist[next]) {\n            dist[next] = dist[node] + weight;\n            pq.offer(new int[]{next, dist[next]});\n        }\n    }\n}',
  timeComplexity: 'O((V + E) log V) with a binary heap priority queue',
  spaceComplexity: 'O(V + E) for the adjacency list and distance array',
  whyComplexityIsNotObvious: 'The \'stale entry\' check is the subtle part — the priority queue can hold multiple outdated entries for the same node from before a shorter path was found, and without discarding them the algorithm silently does extra (but not incorrect) work; a naive implementation might otherwise process a node\'s stale distance as if it were final.',
  commonMistakes: [
    'Not discarding stale priority queue entries, leading to reprocessing a node with an outdated distance',
    'Trying to use Dijkstra directly with negative edge weights (it will produce wrong answers, not just run slower)',
    'Forgetting to relax an edge correctly (comparing dist[node] + weight against dist[next], not just weight)'
  ],
  edgeCaseChecklist: [
    'disconnected graph (some nodes unreachable — dist stays infinity)',
    'start equals destination',
    'negative edge weights present (invalid input for Dijkstra)',
    'multiple edges between the same pair of nodes with different weights'
  ],
  variants: 'Dijkstra for non-negative weighted shortest path; Bellman-Ford for graphs with negative weights (and cycle detection); 0-1 BFS (deque-based) for graphs with only 0/1 edge weights; Dijkstra with a step/stop limit (K-stops constrained variant).',
  interviewFollowUps: [
    'Why doesn\'t Dijkstra work correctly with negative edge weights — can you construct a counterexample?',
    'How would you adapt this if you\'re limited to at most K stops/edges?',
    'What\'s the difference in approach between Dijkstra and Bellman-Ford, and when would you choose each?'
  ],
  relatedPatterns: [
    'graph-bfs-dfs',
    'heap-top-k'
  ],
  difficultyToLearn: 4,
  frequencyScore: 3
};

export const SHORTEST_PATH_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '743',
    title: 'Network Delay Time',
    url: 'https://leetcode.com/problems/network-delay-time/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '787',
    title: 'Cheapest Flights Within K Stops',
    url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '1631',
    title: 'Path With Minimum Effort',
    url: 'https://leetcode.com/problems/path-with-minimum-effort/',
    difficulty: 'Medium',
    role: 'HARD',
    orderIndex: 3
  },
];
