import { TreeNode, Trace } from '../model';

// Level-order array, LeetCode-style: null = no node at that position.
export interface TreeInput { levelOrder: (number | null)[]; }

export const TREE_DFS_CODE =
`void inorder(TreeNode node, List<Integer> out) {
  if (node == null) return;
  inorder(node.left, out);
  out.add(node.val);       // visit
  inorder(node.right, out);
}`;

function buildTree(levelOrder: (number | null)[]): { nodes: TreeNode[]; rootId: string | null } {
  const nodes: TreeNode[] = [];
  if (!levelOrder.length || levelOrder[0] === null) return { nodes, rootId: null };

  const makeId = (i: number) => `n${i}`;
  levelOrder.forEach((v, i) => {
    if (v !== null) nodes.push({ id: makeId(i), value: v, left: null, right: null });
  });

  const byIndex = new Map(levelOrder.map((v, i) => [i, v]));
  for (let i = 0; i < levelOrder.length; i++) {
    if (levelOrder[i] === null) continue;
    const node = nodes.find(n => n.id === makeId(i))!;
    const li = 2 * i + 1, ri = 2 * i + 2;
    if (byIndex.has(li) && byIndex.get(li) !== null) node.left = makeId(li);
    if (byIndex.has(ri) && byIndex.get(ri) !== null) node.right = makeId(ri);
  }

  return { nodes, rootId: makeId(0) };
}

export function generateTreeDfsTrace(input: TreeInput): Trace {
  const { nodes, rootId } = buildTree(input.levelOrder);
  const state = { nodes, rootId };
  const frames: Trace['frames'] = [];
  let step = 0;
  let order = 0;
  const visited: string[] = [];
  const callStack: string[] = [];
  const settledIds: string[] = [];

  const byId = new Map(nodes.map(n => [n.id, n]));

  const frame = (id: string | null, explanation: string, tone: 'active' | 'answer') => {
    frames.push({
      step: step++, explanation, state,
      highlights: [
        ...settledIds.map(sid => ({ kind: 'node' as const, id: sid, tone: 'settled' as const, index: visited.indexOf(sid) })),
        ...(id ? [{ kind: 'node' as const, id, tone }] : []),
      ],
      pointers: [], vars: { callStack: callStack.join(' > ') || '(empty)', visited: visited.join(',') || '—' },
      codeLine: tone === 'answer' ? 3 : 1,
    });
  };

  const visit = (id: string | null) => {
    if (!id || !byId.has(id)) return;
    callStack.push(id);
    frame(id, `Call inorder(${byId.get(id)!.value}) — recurse left first.`, 'active');

    visit(byId.get(id)!.left);

    order++;
    visited.push(id);
    settledIds.push(id);
    frame(id, `Visit ${byId.get(id)!.value} — this is the ${order}${order === 1 ? 'st' : order === 2 ? 'nd' : order === 3 ? 'rd' : 'th'} node in in-order sequence.`, 'answer');

    visit(byId.get(id)!.right);
    callStack.pop();
  };

  frames.push({
    step: step++, explanation: `In-order DFS: visit left subtree, then this node, then right subtree. The call stack (shown in the rail) is what makes this depth-first.`,
    state, highlights: [], pointers: [], vars: { callStack: '(empty)' }, codeLine: 0,
  });

  visit(rootId);

  frames.push({
    step: step++, explanation: `Traversal complete: ${visited.map(id => byId.get(id)!.value).join(', ')}.`,
    state, highlights: settledIds.map((sid, i) => ({ kind: 'node' as const, id: sid, tone: 'settled' as const, index: i })),
    pointers: [], vars: { visited: visited.map(id => byId.get(id)!.value).join(',') }, codeLine: 0,
  });

  return { structure: 'tree', frames, code: TREE_DFS_CODE };
}
