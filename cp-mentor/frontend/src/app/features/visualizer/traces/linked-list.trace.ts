import { LinkedListNode, Trace } from '../model';

export interface LinkedListCycleInput { values: number[]; cyclePos: number; } // cyclePos = -1 for no cycle

export const FAST_SLOW_CODE =
`boolean hasCycle(Node head) {
  Node slow = head, fast = head;
  while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;
  }
  return false;
}`;

export function generateFastSlowTrace(input: LinkedListCycleInput): Trace {
  const ids = input.values.map((_, i) => `n${i}`);
  const nodes: LinkedListNode[] = input.values.map((v, i) => ({
    id: ids[i], value: v,
    next: i < ids.length - 1 ? ids[i + 1] : (input.cyclePos >= 0 ? ids[input.cyclePos] : null),
  }));
  const state = { nodes, headId: ids[0] ?? null };

  const frames: Trace['frames'] = [];
  let step = 0;

  frames.push({
    step: step++, explanation: `Two pointers start at head. Slow moves one node at a time, fast moves two. If there's a cycle, fast will lap slow.`,
    state, highlights: [], pointers: ids.length ? [{ name: 'slow', id: ids[0] }, { name: 'fast', id: ids[0] }] : [],
    vars: {}, codeLine: 1,
  });

  const nextOf = (id: string | null): string | null => id ? nodes.find(n => n.id === id)?.next ?? null : null;

  let slow: string | null = ids[0] ?? null;
  let fast: string | null = ids[0] ?? null;
  let guard = 0;

  while (fast && nextOf(fast) && guard < ids.length * 2 + 2) {
    guard++;
    slow = nextOf(slow);
    fast = nextOf(nextOf(fast));

    frames.push({
      step: step++, explanation: `slow -> ${slow ?? 'null'}, fast -> ${fast ?? 'null'} (fast moved two steps).`,
      state, highlights: [], pointers: [
        ...(slow ? [{ name: 'slow', id: slow }] : []),
        ...(fast ? [{ name: 'fast', id: fast }] : []),
      ], vars: {}, codeLine: 4,
    });

    if (slow && fast && slow === fast) {
      frames.push({
        step: step++, explanation: `slow and fast landed on the same node — that's only possible if there's a cycle. Return true.`,
        state, highlights: [{ kind: 'node', id: slow, tone: 'answer' }],
        pointers: [{ name: 'slow/fast', id: slow }], vars: { result: true }, codeLine: 5,
      });
      return { structure: 'linked-list', frames, code: FAST_SLOW_CODE };
    }
  }

  frames.push({
    step: step++, explanation: `Fast pointer reached the end — no cycle.`,
    state, highlights: [], pointers: [], vars: { result: false }, codeLine: 7,
  });

  return { structure: 'linked-list', frames, code: FAST_SLOW_CODE };
}
