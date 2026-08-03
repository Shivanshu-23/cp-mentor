// Source: "How to Analyse and Approach a DSA Problem", Part 4 — The Recovery Protocol.

export const RECOVERY_INTRO =
  'Reading a solution teaches you almost nothing. Solving problems and then forgetting them ' +
  'happens because reading feels like learning. It is not. Here is what converts a read ' +
  'solution into a retained one.';

export interface RecoveryStep {
  step: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
}

export const RECOVERY_STEPS: RecoveryStep[] = [
  { step: 1, title: 'Close everything.', body: 'Every tab, every note.' },
  { step: 2, title: 'Wait 10 minutes.', body: 'Do a different problem, get water, walk around.' },
  {
    step: 3,
    title: 'Re-implement from a blank editor, no reference.',
    body: 'If you cannot, you did not learn it — go back to the idea, not the code.'
  },
  {
    step: 4,
    title: 'Log the missed observation.',
    body: 'Not the solution. The single thing you failed to notice.'
  },
  {
    step: 5,
    title: 'Re-solve at Day+2 and Day+7.',
    body: 'The problem counts as genuinely solved only after the Day+7 re-solve succeeds.'
  }
];
