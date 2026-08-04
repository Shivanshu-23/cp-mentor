// Source: "How to Analyse and Approach a DSA Problem", Phase 0 — Constraints First.

export interface ComplexityBudgetRow {
  nConstraint: string;
  intendedComplexity: string;
  typicalTechnique: string;
}

export const COMPLEXITY_BUDGET: ComplexityBudgetRow[] = [
  { nConstraint: 'n ≤ 10-12', intendedComplexity: 'O(n!)', typicalTechnique: 'Permutations, full backtracking' },
  { nConstraint: 'n ≤ 20-25', intendedComplexity: 'O(2ⁿ)', typicalTechnique: 'Bitmask DP, subset enumeration' },
  { nConstraint: 'n ≤ 100-500', intendedComplexity: 'O(n³)', typicalTechnique: 'Interval DP, Floyd-Warshall, matrix chain' },
  { nConstraint: 'n ≤ 2,000-5,000', intendedComplexity: 'O(n²)', typicalTechnique: '2D DP, all-pairs comparison' },
  { nConstraint: 'n ≤ 10⁵-10⁶', intendedComplexity: 'O(n log n) or O(n)', typicalTechnique: 'Sort, heap, two pointer, sliding window, hashing' },
  { nConstraint: 'n ≤ 10⁹', intendedComplexity: 'O(log n) or O(1)', typicalTechnique: 'Binary search on the answer, maths, bit tricks' },
  { nConstraint: 'n ≤ 10¹⁸', intendedComplexity: 'O(log n)', typicalTechnique: 'Matrix exponentiation, digit DP, number theory' }
];

export const CONSTRAINTS_INTRO =
  'This is the single most underused technique on LeetCode. Constraints leak the intended ' +
  'complexity before you read a word of the problem.';

export interface ConstraintQuestion {
  question: string;
  implication: string;
}

export const ALSO_EXTRACT_QUESTIONS: ConstraintQuestion[] = [
  { question: 'Can values be negative?', implication: 'kills many greedy and prefix-sum shortcuts' },
  { question: 'Can values be zero?', implication: 'division-based tricks die' },
  { question: 'Are values bounded and small (e.g. 0 <= v <= 100)?', implication: 'counting sort, frequency array of fixed size, bitset' },
  { question: 'Is the array sorted?', implication: 'two pointer and binary search are immediately live' },
  { question: 'Are elements distinct or can they repeat?', implication: 'changes almost every two-pointer implementation' },
  { question: 'What is the minimum n?', implication: 'n >= 1 versus n >= 0 changes your guard clauses' }
];

export const CONSTRAINTS_COMMENT_TEMPLATE =
  '// n <= 2*10^4 -> O(n^2) = 4*10^8, too slow. Need O(n) or O(n log n).\n' +
  '// height[i] can be 0. n can be 1.';

export const CONSTRAINTS_ACTION =
  'Write the target down before continuing. Literally type it as a comment:';

// Compact copy deck (2026-08-04) — see phases.ts for the pattern this follows.
export const CONSTRAINTS_COMPACT =
  'Read the constraints before the statement. Write the target down as a comment.';
