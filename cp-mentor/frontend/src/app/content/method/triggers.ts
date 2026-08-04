// Source: "How to Analyse and Approach a DSA Problem", Part 5 — The Trigger Log,
// and Part 6 — Trigger Dictionary.

export const TRIGGER_LOG_INTRO =
  'Keep one file. This is the highest-leverage artefact in your entire preparation.';

export const TRIGGER_LOG_FORMAT_EXAMPLE =
  'LC 152 — Maximum Product Subarray\n' +
  'Trigger: subarray + multiplication\n' +
  'Missed: negatives swap min and max, so carry BOTH running values\n' +
  'Family: Kadane variant\n' +
  'Reuse in: any running-state scan where the operation is not monotonic\n' +
  'Redo: Aug 04 [x] Aug 09 [ ] Aug 23 [ ]';

export const WHY_TRIGGER_MATTERS = {
  heading: 'Why Trigger is the most valuable line',
  body:
    'Trigger records the surface feature you will see in a future problem that should make you ' +
    'reach for this idea.',
  goodTrigger: 'subarray + multiplication',
  uselessTrigger: 'the solution uses two variables',
  comparisonCaption:
    'The first is retrievable under interview pressure, the second is not.',
  closing:
    'You are not memorising solutions. You are building a lookup table from problem symptoms to ' +
    'pattern names.'
};

export const DAILY_REVISION =
  'At the start of every session, read only the trigger lines — not the full entries — for ' +
  'five minutes. That is your entire revision block. It works because recognition of surface ' +
  'features is precisely the skill that decays, and precisely the skill interviews test.';

export interface TriggerDictionaryRow {
  surfaceFeature: string;
  reachFor: string;
}

// All seventeen rows, verbatim.
export const TRIGGER_DICTIONARY: TriggerDictionaryRow[] = [
  { surfaceFeature: '"contiguous subarray" + longest/shortest', reachFor: 'Sliding window' },
  { surfaceFeature: '"subarray sum equals K"', reachFor: 'Prefix sum + hash map' },
  { surfaceFeature: 'Sorted array, find a pair/triplet', reachFor: 'Two pointer' },
  { surfaceFeature: '"next greater" / "previous smaller" / histogram', reachFor: 'Monotonic stack' },
  { surfaceFeature: '"top K" / "K-th largest" / "median of stream"', reachFor: 'Heap' },
  { surfaceFeature: '"minimise the maximum" / "maximise the minimum"', reachFor: 'Binary search on answer' },
  { surfaceFeature: 'Overlapping ranges, meetings, merging', reachFor: 'Sort by start, sweep' },
  { surfaceFeature: '"number of ways" / "minimum cost to reach"', reachFor: 'DP' },
  { surfaceFeature: '"all combinations" / "all permutations"', reachFor: 'Backtracking' },
  { surfaceFeature: 'Grid, islands, regions, flood', reachFor: 'BFS or DFS' },
  { surfaceFeature: '"prerequisites" / "ordering" / "course schedule"', reachFor: 'Topological sort' },
  { surfaceFeature: 'Connectivity, "are these in the same group"', reachFor: 'Union-Find (DSU)' },
  { surfaceFeature: 'Prefix matching, autocomplete, word search', reachFor: 'Trie' },
  { surfaceFeature: 'n ≤ 25, choose a subset', reachFor: 'Bitmask' },
  { surfaceFeature: 'Answer at index i depends on both sides', reachFor: 'Prefix array + suffix array' },
  { surfaceFeature: 'Cycle in a linked list or a functional graph', reachFor: 'Fast and slow pointer' },
  { surfaceFeature: 'Repeated range queries with updates', reachFor: 'Segment tree / Fenwick tree' }
];

export const TRIGGER_DICTIONARY_NOTE = 'Build your own version of this as you go. Starter set:';
