// Fetched from the live, seeded backend (GET /api/v1/method/patterns/tree-dfs and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const TREE_DFS: Pattern = {
  slug: 'tree-dfs',
  name: 'Tree Depth-First Search',
  category: 'TREE',
  intuition: 'Go as deep as possible down one branch before backtracking, using the call stack (or an explicit stack) to remember where to return to — like exploring a family tree by always visiting a person\'s first child before their siblings.',
  recognitionTriggers: [
    'path sum in a tree',
    'maximum depth',
    'diameter of a tree',
    'validate/serialize a binary tree',
    'root-to-leaf path problems'
  ],
  antiTriggers: [
    'level-by-level information is what\'s needed (that\'s BFS)',
    'the tree is so deep that the recursion stack itself would overflow'
  ],
  javaTemplate: 'int maxDepth(TreeNode node) {\n    if (node == null) return 0;\n    int left = maxDepth(node.left);\n    int right = maxDepth(node.right);\n    return 1 + Math.max(left, right);\n}',
  timeComplexity: 'O(n) — visits every node exactly once',
  spaceComplexity: 'O(h) where h is tree height (recursion stack) — O(n) worst case for a skewed tree, O(log n) for a balanced one',
  whyComplexityIsNotObvious: 'The space complexity is easy to underestimate: it\'s not O(1) just because there\'s no explicit data structure — the call stack itself holds one frame per level of depth, so a skewed (linked-list-like) tree blows the space up to O(n), not O(log n).',
  commonMistakes: [
    'Forgetting the base case (null node), causing infinite recursion or NPEs',
    'Computing a value that depends on both subtrees but returning the wrong combination (e.g. diameter needs the max depth of each side, but the answer itself is a running max, not the return value)',
    'Not distinguishing \'returning a value up the recursion\' from \'accumulating a global answer\' when both are needed simultaneously'
  ],
  edgeCaseChecklist: [
    'empty tree (null root)',
    'single node tree',
    'completely skewed tree (essentially a linked list)',
    'balanced vs unbalanced tree for stack depth reasoning'
  ],
  variants: 'Preorder/inorder/postorder traversal; path-sum style problems tracking a running value down the recursion; problems needing both a \'return value\' and a separate \'global best\' tracked via an instance field or array.',
  interviewFollowUps: [
    'What\'s the space complexity here, and how does it change for a skewed vs balanced tree?',
    'How would you convert this to an iterative solution using an explicit stack?',
    'How would you handle a tree so deep that recursion would stack-overflow?'
  ],
  relatedPatterns: [
    'tree-bfs',
    'bst-properties',
    'recursion-backtracking'
  ],
  difficultyToLearn: 2,
  frequencyScore: 5
};

export const TREE_DFS_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '104',
    title: 'Maximum Depth of Binary Tree',
    url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    difficulty: 'Easy',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '112',
    title: 'Path Sum',
    url: 'https://leetcode.com/problems/path-sum/',
    difficulty: 'Easy',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '124',
    title: 'Binary Tree Maximum Path Sum',
    url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
];
