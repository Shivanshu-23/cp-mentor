// Fetched from the live, seeded backend (GET /api/v1/method/patterns/recursion-backtracking and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const RECURSION_BACKTRACKING: Pattern = {
  slug: 'recursion-backtracking',
  name: 'Backtracking',
  category: 'DESIGN',
  intuition: 'Build a solution incrementally, and the moment a partial choice can\'t possibly lead to a valid answer, undo it and try the next option — like exploring a maze by always going forward, but backing up to the last junction the instant you hit a dead end instead of starting over from scratch.',
  recognitionTriggers: [
    'generate all permutations/combinations/subsets',
    'N-Queens',
    'Sudoku solver',
    'word search on a grid',
    'generate all valid parentheses'
  ],
  antiTriggers: [
    'only a single optimal answer is needed, not all possibilities (DP or greedy is likely faster)',
    'the search space is too large for exponential exploration even with pruning'
  ],
  javaTemplate: 'void backtrack(List<Integer> path, boolean[] used, List<List<Integer>> result, int[] nums) {\n    if (path.size() == nums.length) {\n        result.add(new ArrayList<>(path));\n        return;\n    }\n    for (int i = 0; i < nums.length; i++) {\n        if (used[i]) continue;\n        used[i] = true;\n        path.add(nums[i]);\n        backtrack(path, used, result, nums);   // choose\n        path.remove(path.size() - 1);          // un-choose\n        used[i] = false;\n    }\n}',
  timeComplexity: 'Typically O(n!) or O(2^n) depending on the branching factor — bounded below by the number of valid outputs',
  spaceComplexity: 'O(n) for the recursion stack/current path, plus output storage',
  whyComplexityIsNotObvious: 'The complexity is dictated by how many leaves the search tree has after pruning, not by a clean formula — the same backtracking skeleton can be exponential or near-linear depending entirely on how aggressive and how early the pruning/constraint checks are.',
  commonMistakes: [
    'Forgetting to undo a choice (the \'un-choose\' step) before trying the next branch, corrupting shared state',
    'Pruning too late — checking validity only at a complete solution instead of at each partial step',
    'Copying the path incorrectly (adding a reference instead of a new list, so all results end up pointing to the same mutated list)'
  ],
  edgeCaseChecklist: [
    'empty input',
    'input where no valid solution exists',
    'input where every candidate is valid (worst-case branching)',
    'duplicate values requiring extra pruning to avoid duplicate results'
  ],
  variants: 'Permutations (choose without replacement, order matters); combinations/subsets (choose without replacement, order doesn\'t matter); constraint satisfaction with heavy pruning (N-Queens, Sudoku); grid-based backtracking with visited-marking (word search).',
  interviewFollowUps: [
    'How would you prune this search space more aggressively to avoid exploring dead ends?',
    'What\'s the difference in your solution between generating permutations vs combinations vs subsets?',
    'How would you modify this to return just one valid solution instead of all of them?'
  ],
  relatedPatterns: [
    'tree-dfs',
    'graph-bfs-dfs'
  ],
  difficultyToLearn: 4,
  frequencyScore: 4
};

export const RECURSION_BACKTRACKING_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '78',
    title: 'Subsets',
    url: 'https://leetcode.com/problems/subsets/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '46',
    title: 'Permutations',
    url: 'https://leetcode.com/problems/permutations/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '51',
    title: 'N-Queens',
    url: 'https://leetcode.com/problems/n-queens/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
];
