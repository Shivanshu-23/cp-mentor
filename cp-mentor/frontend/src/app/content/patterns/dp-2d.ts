// Fetched from the live, seeded backend (GET /api/v1/method/patterns/dp-2d and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const DP_2D: Pattern = {
  slug: 'dp-2d',
  name: '2D Dynamic Programming',
  category: 'DP',
  intuition: 'When a subproblem\'s identity genuinely depends on two independent variables at once (two string positions, or an item index plus remaining capacity), the memo/table needs two dimensions — like a spreadsheet grid where a cell\'s formula references cells in the row above and the column to the left, not just a single running list.',
  recognitionTriggers: [
    'longest common subsequence',
    'edit distance',
    '0/1 knapsack',
    'unique paths in a grid',
    'matching two strings/sequences'
  ],
  antiTriggers: [
    'the state can actually be described with a single index plus a rolling summary (collapses to 1D DP)',
    'the two dimensions don\'t actually interact in the recurrence (they\'re independent subproblems, not one 2D problem)'
  ],
  javaTemplate: 'int[][] dp = new int[m + 1][n + 1]; // dp[i][j] = answer using first i of A, first j of B\nfor (int i = 1; i <= m; i++) {\n    for (int j = 1; j <= n; j++) {\n        if (a.charAt(i - 1) == b.charAt(j - 1)) {\n            dp[i][j] = dp[i - 1][j - 1] + 1;\n        } else {\n            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n}\nreturn dp[m][n];',
  timeComplexity: 'O(m * n)',
  spaceComplexity: 'O(m * n), reducible to O(min(m, n)) by keeping only the previous row/column if the recurrence only looks one row back',
  whyComplexityIsNotObvious: 'It\'s easy to assume this must be O(m*n) space forever since the table is 2D, but if the recurrence for dp[i][j] only ever references row i-1, the space can be rolled down to two 1D arrays — the time complexity doesn\'t change, but people often miss that the space bound isn\'t fundamentally tied to the table\'s shape.',
  commonMistakes: [
    'Off-by-one between 0-indexed strings and the 1-indexed dp table (dp[i][j] representing \'first i characters\', not \'character at index i\')',
    'Filling the table in the wrong order, referencing a cell that hasn\'t been computed yet',
    'Not initializing the base row/column (dp[0][j], dp[i][0]) correctly, especially for edit-distance-style problems where they represent \'insert/delete everything\''
  ],
  edgeCaseChecklist: [
    'one or both inputs empty',
    'identical inputs (e.g. LCS of a string with itself)',
    'completely disjoint inputs (no common elements at all)',
    'single-character/single-row or single-column inputs'
  ],
  variants: 'String-matching DP (LCS, edit distance, matching with wildcards); grid path-counting DP (unique paths, minimum path sum); 0/1 knapsack (item index x remaining capacity); interval DP (dp[i][j] over a range, e.g. matrix chain multiplication, burst balloons).',
  interviewFollowUps: [
    'Can you reduce the space from O(m*n) to O(min(m,n))? Which cells does dp[i][j] actually depend on?',
    'How would you reconstruct the actual optimal sequence, not just its length/cost?',
    'How does this recurrence change for edit distance vs longest common subsequence — what\'s actually different?'
  ],
  relatedPatterns: [
    'dp-1d',
    'recursion-backtracking'
  ],
  difficultyToLearn: 4,
  frequencyScore: 4
};

export const DP_2D_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '1143',
    title: 'Longest Common Subsequence',
    url: 'https://leetcode.com/problems/longest-common-subsequence/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '62',
    title: 'Unique Paths',
    url: 'https://leetcode.com/problems/unique-paths/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '72',
    title: 'Edit Distance',
    url: 'https://leetcode.com/problems/edit-distance/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
];
