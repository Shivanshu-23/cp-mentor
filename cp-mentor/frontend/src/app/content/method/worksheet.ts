// Source: "How to Analyse and Approach a DSA Problem", Part 11 — Per-Problem Worksheet.
// The interactive equivalent of this exact worksheet is the Solve Session feature
// (POST/PATCH /api/v1/method/sessions); this content module backs the printable/offline
// blank-form rendering (used by method-guide.component.html and, later, /method/worksheet).

export const WORKSHEET_INTRO =
  'Fill one of these for every problem you attempt. Keep them in a single file, one block per ' +
  'problem. Twenty minutes of filled worksheets is worth more revision value than two hours of ' +
  're-reading solutions.';

export interface WorksheetField {
  label: string;
}

export interface WorksheetSection {
  heading: string;
  fields: WorksheetField[];
  checklist?: string[];
}

export const WORKSHEET_SECTIONS: WorksheetSection[] = [
  {
    heading: 'Header',
    fields: [
      { label: 'PROBLEM' }, { label: 'LC #' }, { label: 'Difficulty' },
      { label: 'Date' }, { label: 'Timer started at' }
    ]
  },
  {
    heading: 'Phase 0: Constraints (before reading the statement)',
    fields: [
      { label: 'n up to' }, { label: 'values range' },
      { label: 'Sorted?' }, { label: 'Negatives?' }, { label: 'Zeros?' }, { label: 'Duplicates?' },
      { label: 'TARGET COMPLEXITY' }
    ]
  },
  {
    heading: 'Phase 1: Restate + Brute Force',
    fields: [
      { label: 'One-sentence restatement' },
      { label: 'Brute force idea' },
      { label: 'Brute force complexity: Time' }, { label: 'Space' }
    ]
  },
  {
    heading: 'Phase 2: Hand-Solve',
    fields: [
      { label: 'Small input used' }, { label: 'Answer by hand' },
      { label: 'What did my brain actually do?' }
    ]
  },
  {
    heading: 'Phase 3: Bottleneck',
    fields: [
      { label: 'What exactly am I recomputing? (be precise, not vague)' },
      { label: 'Chosen approach (one sentence)' },
      { label: 'Final complexity: Time' }, { label: 'Space' }
    ],
    checklist: [
      '1. Store instead of recompute (hash / prefix / memo)',
      '2. Pointer or window never moves backwards',
      '3. Sort first, then sweep',
      '4. Only max/min matters (heap / monotonic stack)',
      '5. Answer is monotonic (binary search the answer)',
      'None fired -> DP? graph? greedy? bitmask?'
    ]
  },
  {
    heading: 'Phase 5: Dry Run',
    fields: [],
    checklist: [
      'n = 1 / minimum input',
      'all elements identical',
      'all negatives',
      'sorted ascending and descending',
      'duplicates present',
      'overflow check (use long?)',
      'answer at first/last index',
      'no valid answer exists'
    ]
  },
  {
    heading: 'Outcome',
    fields: [
      { label: 'Time taken' }, { label: 'Solved unaided? Y / N' },
      { label: 'Highest rung reached: 1 constraints / 2 example / 3 family / 4 tags / 5 hint / 6 solution' }
    ]
  },
  {
    heading: 'Trigger Log (fill this even if you solved it)',
    fields: [
      { label: 'Trigger' }, { label: 'Missed' }, { label: 'Family' }, { label: 'Reuse in' },
      { label: 'Redo: D+2' }, { label: 'D+7' }
    ]
  },
  {
    heading: 'If Solution Was Read',
    fields: [],
    checklist: [
      'Closed all tabs',
      'Waited 10 minutes',
      'Re-implemented from blank editor with no reference'
    ]
  }
];

// Part — The Whole Thing on One Card
export const ONE_CARD_SUMMARY =
  'CONSTRAINTS -> target complexity, before reading the statement\n' +
  'RESTATE -> one sentence, your own words\n' +
  'BRUTE FORCE -> never be at zero\n' +
  'HAND-SOLVE -> n=5, on paper, then ask what your brain did\n' +
  'BOTTLENECK -> "what am I recomputing?" (be precise)\n' +
  'FIVE MOVES -> store | monotonic pointer | sort | only max matters | binary search answer\n' +
  'PLAN -> one sentence + complexity, BEFORE typing\n' +
  'CODE -> meaningful names\n' +
  'DRY RUN -> n=1, all same, all negative, sorted, duplicates, overflow\n' +
  'STUCK -> constraints -> weird example -> name family -> tags -> hint -> solution\n' +
  'AFTER -> close tab, wait 10 min, reimplement blind, log the TRIGGER, redo D+2 and D+7';
