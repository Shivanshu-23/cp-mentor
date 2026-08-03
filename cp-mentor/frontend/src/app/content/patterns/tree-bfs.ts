// Fetched from the live, seeded backend (GET /api/v1/method/patterns/tree-bfs and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const TREE_BFS: Pattern = {
  slug: 'tree-bfs',
  name: 'Tree Breadth-First Search',
  category: 'TREE',
  intuition: 'Visit the tree one full level at a time using a queue, processing all nodes at depth d before any node at depth d+1 — like reading a family tree generation by generation instead of chasing one bloodline to the bottom first.',
  recognitionTriggers: [
    'level order traversal',
    'level averages',
    'right side view of a tree',
    'minimum depth',
    'zigzag traversal'
  ],
  antiTriggers: [
    'you need path information from root to a specific node (DFS naturally tracks the path; BFS doesn\'t without extra bookkeeping)'
  ],
  javaTemplate: 'Queue<TreeNode> queue = new LinkedList<>();\nqueue.offer(root);\nwhile (!queue.isEmpty()) {\n    int levelSize = queue.size();\n    List<Integer> level = new ArrayList<>();\n    for (int i = 0; i < levelSize; i++) {\n        TreeNode node = queue.poll();\n        level.add(node.val);\n        if (node.left != null) queue.offer(node.left);\n        if (node.right != null) queue.offer(node.right);\n    }\n    result.add(level);\n}',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(w) where w is the maximum width of the tree — up to O(n) for a wide/complete tree',
  whyComplexityIsNotObvious: 'The levelSize snapshot at the top of the loop is the whole trick — without it, you can\'t tell where one level ends and the next begins, since the queue holds a mix of the current and next level\'s nodes at any given point mid-iteration.',
  commonMistakes: [
    'Forgetting to snapshot levelSize before the inner loop, so the level boundary is lost as children get enqueued mid-iteration',
    'Using a Stack instead of a Queue by mistake (that gives DFS-like ordering, not level order)',
    'Not checking for null children before enqueueing them, filling the queue with nulls'
  ],
  edgeCaseChecklist: [
    'empty tree (null root)',
    'single node tree',
    'tree that\'s a single chain (height n, width 1)',
    'complete/perfect tree (maximum width)'
  ],
  variants: 'Standard level-order traversal; zigzag level order (alternate direction per level); right-side view (take the last node of each level); minimum depth (BFS early-exits at the first leaf, unlike DFS which must check both subtrees).',
  interviewFollowUps: [
    'Why does BFS find minimum depth faster than DFS in the worst case?',
    'How would you find the maximum width of the tree, including null gaps?',
    'How would you adapt this for an N-ary tree instead of binary?'
  ],
  relatedPatterns: [
    'tree-dfs',
    'graph-bfs-dfs'
  ],
  difficultyToLearn: 2,
  frequencyScore: 4
};

export const TREE_BFS_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '102',
    title: 'Binary Tree Level Order Traversal',
    url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '199',
    title: 'Binary Tree Right Side View',
    url: 'https://leetcode.com/problems/binary-tree-right-side-view/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '111',
    title: 'Minimum Depth of Binary Tree',
    url: 'https://leetcode.com/problems/minimum-depth-of-binary-tree/',
    difficulty: 'Easy',
    role: 'VARIANT',
    orderIndex: 3
  },
];
