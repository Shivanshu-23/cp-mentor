// Source: "How to Analyse and Approach a DSA Problem", Part 10 — Interview Communication Script.

export const SCRIPT_INTRO =
  'Everything above is also your talk track. In a real interview, narrate the phases out loud ' +
  '— that narration is the signal being graded.';

export interface ScriptStep {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  line: string;
}

export const INTERVIEW_SCRIPT: ScriptStep[] = [
  { step: 1, line: '"Let me check the constraints first. n is up to 10⁵, so I\'m targeting O(n log n) or better."' },
  { step: 2, line: '"Let me restate to make sure I have it: ..."' },
  { step: 3, line: '"The brute force would be ... which is O(n²). Let me confirm that\'s correct, then optimise."' },
  { step: 4, line: '"Let me trace a small example to find the structure." — and actually write it on the board.' },
  { step: 5, line: '"The bottleneck is that I recompute ... at every step. I can store that instead."' },
  { step: 6, line: '"Approach: ... Time O(n), space O(n). Shall I code it?"' },
  { step: 7, line: 'Code, then: "Let me trace it on the example, and check the edge cases: empty, single element, all duplicates."' },
  { step: 8, line: '"For the follow-up on space, I think we could ..."' }
];

export const SCRIPT_CLOSING = {
  lead: 'Never go silent.',
  body:
    'Silence is the only unrecoverable interview failure. If you are stuck, say what you have ' +
    'tried and what you have ruled out — that is still visible progress.'
};
