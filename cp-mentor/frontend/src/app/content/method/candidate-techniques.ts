// New for the /yodh page — not from "How to Analyse and Approach a DSA Problem".
// Explains how to actually use the Constraint Analyzer's candidate-technique
// list: it's a shortlist to test, not a conclusion. Two directions, forward
// (no idea yet) and backward (you already have an idea).

export const CANDIDATE_TECHNIQUES_INTRO =
  'The analyzer narrows the field. It does not pick the answer. The constraint table gives you ' +
  'a shortlist to test, never a conclusion. Use it in two directions.';

export interface CandidateTechniqueStep {
  step: number;
  text: string;
}

export const FORWARD_DIRECTION_INTRO = 'Forward — you have no idea yet:';

export const FORWARD_DIRECTION_STEPS: CandidateTechniqueStep[] = [
  { step: 1, text: 'n gives you the target complexity.' },
  { step: 2, text: 'The target complexity gives you 4-6 candidate techniques.' },
  { step: 3, text: 'The shape of the input (sorted? string? grid? graph? intervals?) eliminates most of them.' },
  { step: 4, text: 'The verb in the question ("longest", "count", "K-th", "minimum maximum") usually leaves one or two.' },
  { step: 5, text: 'Test the survivors against your n = 5 hand-solve from Phase 2.' }
];

export const FORWARD_WORKED_EXAMPLE =
  'Worked example. n ≤ 10⁵, array of integers, question asks for the longest contiguous ' +
  'subarray with at most K distinct values.\n\n' +
  'Step 1: target is O(n log n) or O(n).\n' +
  'Step 2: candidates are sort, heap, two pointer, sliding window, hashing, prefix sum.\n' +
  'Step 3: order matters and the array is unsorted, so sort is out — sorting destroys the ' +
  'contiguity the question depends on.\n' +
  'Step 4: "longest contiguous" plus "at most K" is the sliding window signature. Hashing ' +
  'survives as the frequency map inside the window.\n' +
  'Result: variable sliding window with a hash map. Two techniques, working together.';

export const BACKWARD_DIRECTION_INTRO =
  'Backward — you already have an idea. This is the direction most people never use, and it is ' +
  'the more valuable one. Compute your idea\'s complexity and compare it to the budget:';

export interface BackwardComparisonRow {
  situation: string;
  action: string;
}

export const BACKWARD_COMPARISON: BackwardComparisonRow[] = [
  { situation: 'Meets the budget', action: 'Code it. Stop optimising.' },
  { situation: 'One factor of n too slow', action: 'You do not need a new idea. You need to remove one loop — run the five moves.' },
  { situation: 'Exponentially too slow', action: 'Wrong family. Go back to Phase 2.' },
  { situation: 'Faster than needed', action: 'You may have misread the problem. Re-check the constraints.' }
];

export const BACKWARD_CLOSING =
  'An O(n²) idea against an O(n log n) budget is not a failure — it is a precisely specified ' +
  'task: delete the inner loop. Move 1 (store instead of recompute) and Move 2 (pointer never ' +
  'moves backwards) exist to do exactly that.';

export const CANDIDATE_TECHNIQUES_LINE =
  'Constraints tell you how fast. The question tells you which tool. The intersection is your answer.';

export const CANDIDATE_TECHNIQUES_CLOSING =
  'If the intersection is empty, you have misread one of the two — that is the fastest possible ' +
  'signal to re-read the problem rather than think harder.';
