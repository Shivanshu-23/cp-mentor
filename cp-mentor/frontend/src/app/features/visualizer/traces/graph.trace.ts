import { GraphEdge, GraphNode, Trace } from '../model';

export interface GraphInput {
  nodes: { id: string; x: number; y: number }[];
  edges: { from: string; to: string }[];
  startId: string;
}

export const GRAPH_BFS_CODE =
`Map<String,Integer> bfs(Graph g, String start) {
  Map<String,Integer> dist = new HashMap<>();
  Queue<String> queue = new LinkedList<>();
  dist.put(start, 0);
  queue.add(start);
  while (!queue.isEmpty()) {
    String cur = queue.poll();
    for (String next : g.neighbors(cur)) {
      if (!dist.containsKey(next)) {
        dist.put(next, dist.get(cur) + 1);
        queue.add(next);
      }
    }
  }
  return dist;
}`;

export function generateGraphBfsTrace(input: GraphInput): Trace {
  const adjacency = new Map<string, string[]>();
  input.nodes.forEach(n => adjacency.set(n.id, []));
  input.edges.forEach(e => {
    adjacency.get(e.from)?.push(e.to);
    adjacency.get(e.to)?.push(e.from); // undirected, matching "wave expanding by distance"
  });

  const dist = new Map<string, number>();
  const queue: string[] = [];
  const frames: Trace['frames'] = [];
  let step = 0;

  const labelFor = (id: string) => dist.has(id) ? `${id} (${dist.get(id)})` : id;
  const snapshot = (): { nodes: GraphNode[]; edges: GraphEdge[] } => ({
    nodes: input.nodes.map(n => ({ id: n.id, x: n.x, y: n.y, label: labelFor(n.id) })),
    edges: input.edges.map(e => ({ from: e.from, to: e.to })),
  });

  const toneFor = (id: string) => {
    if (!dist.has(id)) return 'dim';
    if (queue.includes(id)) return 'compare';
    return 'settled';
  };

  const frame = (explanation: string, activeId?: string, codeLine = 5) => {
    frames.push({
      step: step++, explanation, state: snapshot(),
      highlights: input.nodes.map(n => ({ kind: 'node' as const, id: n.id, tone: (n.id === activeId ? 'active' as const : toneFor(n.id)) })),
      pointers: activeId ? [{ name: 'cur', id: activeId }] : [],
      vars: { queue: queue.join(', ') || '(empty)' }, codeLine,
    });
  };

  dist.set(input.startId, 0);
  queue.push(input.startId);
  frame(`Start BFS at ${input.startId}, distance 0. BFS explores in waves — everything at distance d is visited before anything at distance d+1.`, undefined, 3);

  while (queue.length) {
    const cur = queue.shift()!;
    frame(`Dequeue ${cur} (distance ${dist.get(cur)}). Look at its neighbors.`, cur, 6);

    for (const next of adjacency.get(cur) ?? []) {
      if (!dist.has(next)) {
        dist.set(next, dist.get(cur)! + 1);
        queue.push(next);
        frame(`${next} hasn't been visited — set its distance to ${dist.get(next)} and enqueue it.`, cur, 9);
      }
    }
  }

  frame(`BFS complete. Every reachable node now has its shortest distance (in edges) from ${input.startId}.`, undefined, 12);

  return { structure: 'graph', frames, code: GRAPH_BFS_CODE };
}
