// Fetched from the live, seeded backend (GET /api/v1/method/patterns/bst-properties and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const BST_PROPERTIES: Pattern = {
  slug: 'bst-properties',
  name: 'BST Properties',
  category: 'TREE',
  intuition: 'A binary search tree\'s inorder traversal is always sorted — exploit that single invariant instead of re-deriving ordering logic every time, the same way you\'d trust alphabetically-sorted files in a cabinet rather than checking each one against every other.',
  recognitionTriggers: [
    'validate a BST',
    'kth smallest element in a BST',
    'BST to sorted array/list',
    'closest value in a BST',
    'range sum in a BST'
  ],
  antiTriggers: [
    'the tree isn\'t guaranteed to be a valid BST (ordering invariant can\'t be relied on)',
    'you need arbitrary tree operations that don\'t benefit from sortedness'
  ],
  javaTemplate: 'boolean isValidBST(TreeNode node, long lower, long upper) {\n    if (node == null) return true;\n    if (node.val <= lower || node.val >= upper) return false;\n    return isValidBST(node.left, lower, node.val) && isValidBST(node.right, node.val, upper);\n}',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h) recursion stack',
  whyComplexityIsNotObvious: 'The subtle bug most people hit isn\'t complexity — it\'s correctness: checking only that a node\'s value falls between its immediate children looks right but is wrong, because a BST invariant must hold against the ENTIRE left/right subtree\'s range, not just the immediate children — hence propagating bounds down through the recursion.',
  commonMistakes: [
    'Validating only against immediate children instead of propagating the valid (lower, upper) range down the whole subtree',
    'Using int bounds instead of long, causing overflow when node values are at Integer.MIN_VALUE/MAX_VALUE',
    'Forgetting that inorder traversal gives sorted order and re-deriving BST logic from scratch instead of using that fact directly'
  ],
  edgeCaseChecklist: [
    'empty tree',
    'single node',
    'tree with duplicate values (decide if strictly increasing or allowing equals)',
    'values at Integer.MIN_VALUE/MAX_VALUE boundaries'
  ],
  variants: 'BST validation via range propagation; kth smallest via inorder traversal with early termination; BST-to-sorted-array via inorder collection; lowest common ancestor exploiting the ordering to decide left/right without full traversal.',
  interviewFollowUps: [
    'Why is checking only the immediate parent-child relationship insufficient to validate a BST?',
    'How would you find the kth smallest element without doing a full traversal every query?',
    'How does the LCA algorithm simplify for a BST compared to a general binary tree?'
  ],
  relatedPatterns: [
    'tree-dfs',
    'binary-search-array'
  ],
  difficultyToLearn: 3,
  frequencyScore: 3
};

export const BST_PROPERTIES_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '98',
    title: 'Validate Binary Search Tree',
    url: 'https://leetcode.com/problems/validate-binary-search-tree/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '230',
    title: 'Kth Smallest Element in a BST',
    url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '235',
    title: 'Lowest Common Ancestor of a Binary Search Tree',
    url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
    difficulty: 'Medium',
    role: 'VARIANT',
    orderIndex: 3
  },
];
