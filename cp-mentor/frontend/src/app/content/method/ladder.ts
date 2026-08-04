// Source: "How to Analyse and Approach a DSA Problem", Part 3 — The Stuck Ladder.

export interface StuckRung {
  rung: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  timeBudget?: string;
  body: string;
  compact: string;
}

export const STUCK_LADDER_INTRO =
  'Never jump to the editorial. Climb one rung at a time and stop the moment something unlocks.';

// `compact` is the terse copy-deck rewrite of `body`, shown by default; `body`
// renders behind the "Why this works" expander. See phases.ts's compact note.
export const STUCK_LADDER: StuckRung[] = [
  {
    rung: 1,
    title: 'Re-read the constraints.',
    timeBudget: '2 min',
    compact: 'Re-read the constraints — the target is a hint',
    body:
      'You skipped Phase 0 more often than you would like to admit. The complexity target is ' +
      'itself a hint: O(n) rules out any nested loop, which sharply constrains the shape of the ' +
      'answer.'
  },
  {
    rung: 2,
    title: 'Try a differently-shaped example.',
    timeBudget: '5 min',
    compact: 'Try a *weirder* example, not a bigger one',
    body:
      'Not a bigger one — a weirder one. All duplicates. Sorted descending. All negatives. n = 1. ' +
      'Values equal to zero. The counterexample that breaks your current idea usually reveals ' +
      'the correct one.'
  },
  {
    rung: 3,
    title: 'Name the family, do not find the solution.',
    timeBudget: '5 min',
    compact: "Name the family, don't find the solution",
    body:
      'Ask only: which pattern is this? Two pointer, sliding window, binary search, prefix sum, ' +
      'hashing, monotonic stack, heap, greedy, DP, backtracking, graph traversal, union-find, ' +
      'bit manipulation, intervals, maths. Guessing the family narrows the search space ' +
      'enormously without spoiling the derivation.'
  },
  {
    rung: 4,
    title: 'Look at the LeetCode tags only.',
    compact: 'Read the LeetCode tags only, then close the tab',
    body:
      'Open the tags, read nothing else, close the tab. This is a controlled hint: it confirms ' +
      'the family and preserves the derivation, which is the part that actually builds skill.'
  },
  {
    rung: 5,
    title: 'Ask for a Level 1 or Level 2 hint.',
    compact: 'Ask for a Level 1 or Level 2 hint',
    body:
      'Level 1 is a single observation. Level 2 names the pattern and explains why it fits. Both ' +
      'leave the real work with you.'
  },
  {
    rung: 6,
    title: 'Read the solution, and stop reading the instant you understand.',
    compact: 'Read the solution — stop the instant you understand',
    body:
      'The moment the key idea lands, close the tab. Do not read the code. Do not read the ' +
      'complexity analysis. You have the idea; implementing it is your job, and implementing it ' +
      'is where retention comes from.'
  }
];
