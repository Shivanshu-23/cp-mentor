// Source: "How to Analyse and Approach a DSA Problem", Part 0 and Part 1.
// Verbatim wording — do not paraphrase or shorten when editing.

export interface MindsetReframe {
  id: 'TWO_ARTEFACTS' | 'MODEL_COMPUTATION_NOT_PHYSICS';
  statement: string;
  body: string;
}

export const MINDSET_REFRAMES: MindsetReframe[] = [
  {
    id: 'TWO_ARTEFACTS',
    statement: 'On a first attempt, your goal is not to solve the problem.',
    body:
      'Your goal is to produce two artefacts: 1. A working brute force. 2. One sentence stating ' +
      'exactly why it is too slow. If you have both, the attempt succeeded — even if you never ' +
      'reached the optimal solution.\n\n' +
      'Why this matters: "I couldn’t solve it" is a demoralising and useless signal. "I found ' +
      'the O(n²), and the bottleneck is that I recompute the same suffix maximum at every ' +
      'index" is precise and fixable. It is also literally what interviewers score. Nobody ' +
      'expects instant optimal. They expect structured progress from a stated starting point.'
  },
  {
    id: 'MODEL_COMPUTATION_NOT_PHYSICS',
    statement: 'Never model the physics. Model the computation.',
    body:
      'Beginners get stuck on Trapping Rain Water because they imagine water flowing and ' +
      'pooling. Water does not flow in your program. Your program sums numbers. The moment you ' +
      'switch from "how does water behave" to "what number do I compute at each index," the ' +
      'problem collapses.'
  }
];

export interface MethodPhase {
  id: 'CONSTRAINTS' | 'RESTATE_BRUTE_FORCE' | 'HAND_SOLVE' | 'BOTTLENECK_FIVE_MOVES' | 'CODE' | 'DRY_RUN';
  number: 0 | 1 | 2 | 3 | 4 | 5;
  title: string;
  whatYouDo: string;
  timeBudget: string;
}

export const PHASES: MethodPhase[] = [
  { id: 'CONSTRAINTS', number: 0, title: 'Constraints First', whatYouDo: 'Read the constraints before the statement', timeBudget: '2 min' },
  { id: 'RESTATE_BRUTE_FORCE', number: 1, title: 'Restate and Brute Force', whatYouDo: 'Restate in one sentence, state a brute force', timeBudget: '5 min' },
  { id: 'HAND_SOLVE', number: 2, title: 'Solve a Tiny Case By Hand', whatYouDo: 'Solve n = 5 by hand, on paper', timeBudget: '5 min' },
  { id: 'BOTTLENECK_FIVE_MOVES', number: 3, title: 'Name the Bottleneck, Run the Five Moves', whatYouDo: 'Name the bottleneck, run the five moves', timeBudget: '10-15 min' },
  { id: 'CODE', number: 4, title: 'Code', whatYouDo: 'Code', timeBudget: '8-10 min' },
  { id: 'DRY_RUN', number: 5, title: 'Dry Run Before Submitting', whatYouDo: 'Dry run edge cases, then submit', timeBudget: '3 min' }
];

export const PHASE_BUDGET_NOTE = 'Total budget for a medium: about 35 minutes.';

// Phase 1 — Restate and Brute Force
export const RESTATE_GUIDANCE = {
  instruction: 'Restate the problem in one sentence, in your own words.',
  whyItMatters:
    'If you cannot, you have misread it. Misreading is a top-three cause of wasted hours and it ' +
    'is invisible until you have already lost forty minutes.',
  badExample: 'Find the water.',
  goodExample: 'For each index, compute how much water sits directly above that bar, and return the sum.',
  goodExampleNote: "Notice the good restatement already contains the algorithm's shape.",
  bruteForceInstruction:
    'Then state a brute force out loud, however absurd. You should never be at zero. Enumerate ' +
    'everything and check each candidate. If the brute force is O(n!), say so and move on — you ' +
    'have still established a baseline and, more importantly, a definition of correctness you ' +
    'can test the fast solution against.',
  diagnostic:
    'If you cannot even state a brute force, you almost always have the wrong unit of analysis. ' +
    'Go straight to Phase 2.'
};

// Phase 2 — Solve a Tiny Case By Hand
export interface HandSolveExample {
  problem: string;
  whatYourHandDoes: string;
  theAlgorithm: string;
}

export const HAND_SOLVE_GUIDANCE = {
  instruction: 'Take n = 4 or 5. Get out paper. Produce the answer manually.',
  whyPaper:
    'On paper, not in your head. In-head reasoning skips steps and hides exactly the insight you ' +
    'are looking for.',
  theQuestion: 'What did my brain actually just do?',
  followUp:
    'Your hand-method is usually the algorithm in disguise.',
  diagnostic:
    'If your hand-method is genuinely brute force (you checked all pairs), that is information ' +
    'too — it means the insight is not in the problem’s surface and you will need Phase 3 to ' +
    'find it.'
};

export const HAND_SOLVE_EXAMPLES: HandSolveExample[] = [
  { problem: 'Next Permutation', whatYourHandDoes: 'Scan right-to-left looking for the first dip', theAlgorithm: 'Exactly the algorithm' },
  { problem: 'Trapping Rain Water', whatYourHandDoes: 'Look left and right of each hole for walls', theAlgorithm: 'Prefix max and suffix max' },
  { problem: 'Valid Parentheses', whatYourHandDoes: 'Cross off matched pairs inwards', theAlgorithm: 'Stack' },
  { problem: 'Merge Intervals', whatYourHandDoes: 'Sort them mentally, then glue overlaps', theAlgorithm: 'Sort + linear merge' },
  { problem: 'Two Sum', whatYourHandDoes: 'Remember what you have seen so far', theAlgorithm: 'Hash map' }
];

// Phase 4 — Code
export interface JavaHabit {
  habit: string;
}

export const CODE_GUIDANCE = {
  warning:
    'If you did not finish Phase 3 with a clear plan, do not start typing. Coding while confused ' +
    'is how a 30-minute problem becomes a two-hour problem.',
  headerComment: '// Approach: <one sentence>\n// Time: O(?) Space: O(?)'
};

export const JAVA_HABITS: JavaHabit[] = [
  { habit: 'Use int mid = lo + (hi - lo) / 2; — never (lo + hi) / 2, which overflows.' },
  { habit: 'long for sums that can exceed 2³¹, which happens more often than you think.' },
  { habit: 'Name variables for meaning: leftMax, writeIndex, windowStart — not a, temp, x. Interviewers grade this.' },
  { habit: 'Prefer int[] over List<Integer> in hot loops; autoboxing is a real cost.' },
  { habit: 'HashMap.getOrDefault(key, 0) and map.merge(key, 1, Integer::sum) keep frequency code short.' },
  { habit: 'Deque<Integer> stack = new ArrayDeque<>(); — not Stack, which is legacy and synchronised.' },
  { habit: 'Arrays.sort() on int[] is dual-pivot quicksort with O(n²) worst case; on Integer[] it is stable TimSort. This distinction has been an actual interview question.' }
];

// Phase 5 — Dry Run
export const DRY_RUN_CHECKLIST: string[] = [
  'Minimum input: n = 1, or the empty case if permitted',
  'All elements identical',
  'All negatives (if values can be negative)',
  'Already sorted, and sorted in reverse',
  'Duplicates present',
  'Maximum size — does anything overflow?',
  'The answer is at the very first or very last index',
  'No valid answer exists — what do you return?'
];

export const DRY_RUN_CLOSING =
  'Getting a wrong-answer verdict you could have predicted costs you the debugging time and the ' +
  'confidence. Both are expensive.';

// Part 2 — Time Caps
export interface TimeCap {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cap: string;
}

export const TIME_CAPS: TimeCap[] = [
  { difficulty: 'Easy', cap: '15 minutes' },
  { difficulty: 'Medium', cap: '35 minutes' },
  { difficulty: 'Hard', cap: '55 minutes' }
];

export const TIME_CAP_INSTRUCTION = 'Set an actual timer.';

export const TIME_CAP_RATIONALE =
  'Past the cap, additional staring produces near-zero learning — you are only rehearsing being ' +
  'stuck. Discipline here is the difference between 300 problems and 300 hours.';
