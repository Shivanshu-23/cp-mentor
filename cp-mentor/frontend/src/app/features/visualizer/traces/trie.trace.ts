import { TrieNode, Trace } from '../model';

export interface TrieInput { insertWords: string[]; searchWord: string; }

export const TRIE_CODE =
`void insert(String word) {
  TrieNode cur = root;
  for (char c : word.toCharArray()) {
    cur = cur.children.computeIfAbsent(c, k -> new TrieNode());
  }
  cur.isEnd = true;
}

boolean search(String word) {
  TrieNode cur = root;
  for (char c : word.toCharArray()) {
    if (!cur.children.containsKey(c)) return false;
    cur = cur.children.get(c);
  }
  return cur.isEnd;
}`;

export function generateTrieTrace(input: TrieInput): Trace {
  const nodes = new Map<string, TrieNode>();
  let nextId = 0;
  const newNode = (char: string): TrieNode => {
    const id = `t${nextId++}`;
    const node: TrieNode = { id, char, children: {}, isEnd: false };
    nodes.set(id, node);
    return node;
  };

  const root = newNode('');
  const frames: Trace['frames'] = [];
  let step = 0;

  const snapshot = (): { nodes: TrieNode[]; rootId: string } => ({
    nodes: [...nodes.values()].map(n => ({ ...n, children: { ...n.children } })),
    rootId: root.id,
  });

  frames.push({
    step: step++, explanation: `Empty trie — just a root node.`,
    state: snapshot(), highlights: [], pointers: [], vars: {}, codeLine: 0,
  });

  for (const word of input.insertWords) {
    let cur = root;
    let reusedCount = 0;
    for (const c of word) {
      if (cur.children[c]) {
        cur = nodes.get(cur.children[c])!;
        reusedCount++;
        frames.push({
          step: step++, explanation: `Inserting "${word}": '${c}' already has a branch here — reuse it, no new node needed.`,
          state: snapshot(), highlights: [{ kind: 'node', id: cur.id, tone: 'compare' }], pointers: [], vars: { word }, codeLine: 3,
        });
      } else {
        const child = newNode(c);
        cur.children[c] = child.id;
        cur = child;
        frames.push({
          step: step++, explanation: `Inserting "${word}": no branch for '${c}' yet — grow a new node.`,
          state: snapshot(), highlights: [{ kind: 'node', id: cur.id, tone: 'active' }], pointers: [], vars: { word }, codeLine: 3,
        });
      }
    }
    cur.isEnd = true;
    frames.push({
      step: step++, explanation: `"${word}" fully inserted (${reusedCount} node${reusedCount === 1 ? '' : 's'} reused from a shared prefix). Mark the last node as a word end.`,
      state: snapshot(), highlights: [{ kind: 'node', id: cur.id, tone: 'answer' }], pointers: [], vars: { word, nodeCount: nodes.size }, codeLine: 6,
    });
  }

  // Search
  let cur: TrieNode | undefined = root;
  let found = true;
  for (const c of input.searchWord) {
    const childId = cur?.children[c];
    if (!childId) { found = false; break; }
    cur = nodes.get(childId);
    frames.push({
      step: step++, explanation: `Searching "${input.searchWord}": follow '${c}'.`,
      state: snapshot(), highlights: cur ? [{ kind: 'node', id: cur.id, tone: 'active' }] : [], pointers: [],
      vars: { search: input.searchWord }, codeLine: 12,
    });
  }
  const isWord = found && !!cur?.isEnd;

  frames.push({
    step: step++,
    explanation: !found
      ? `No branch for the next character — "${input.searchWord}" is not in the trie.`
      : isWord
        ? `Path exists and the final node is marked as a word end — "${input.searchWord}" is in the trie.`
        : `Path exists but the final node isn't marked as a word end — "${input.searchWord}" is only a prefix of something else, not a stored word.`,
    state: snapshot(), highlights: found && cur ? [{ kind: 'node', id: cur.id, tone: isWord ? 'answer' : 'dim' }] : [],
    pointers: [], vars: { search: input.searchWord, found: isWord, nodeCount: nodes.size }, codeLine: 14,
  });

  return { structure: 'trie', frames, code: TRIE_CODE };
}
