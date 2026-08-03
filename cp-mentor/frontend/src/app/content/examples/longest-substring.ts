// Source: "How to Analyse and Approach a DSA Problem", Part 9 — Worked Example C: Compressed
// (Longest Substring Without Repeating Characters).
import { WorkedExample } from './types';

export const LONGEST_SUBSTRING: WorkedExample = {
  slug: 'longest-substring-no-repeat',
  title: 'Longest Substring Without Repeating Characters',
  leetcodeId: 3,
  difficulty: 'Medium',
  intro: 'Compressed walkthrough.',
  constraints: {
    raw: '',
    analysis:
      'n ≤ 5×10⁴ → need O(n). Characters include digits, symbols, spaces — do not assume ' +
      'lowercase-only.'
  },
  restateAndBruteForce: {
    body: [
      'Restate: "the longest contiguous stretch with no character appearing twice." Brute ' +
        'force: check every substring for uniqueness, O(n³), or O(n²) with an incremental set.'
    ]
  },
  handSolve: {
    body: [
      'On "abcabcbb" by hand, you extend right until you hit a repeat, then you move the left ' +
        'edge past the previous occurrence of that character — you never move left backwards.'
    ]
  },
  bottleneck: {
    body: [
      'Bottleneck: I re-check characters already known to be unique. Move 2 fires — the left ' +
        'pointer is monotonic. Move 1 also fires — a hash map storing the last index of each ' +
        'character makes the left jump O(1) instead of a scan. Result: O(n) time, ' +
        'O(min(n, alphabet)) space.',
      'Trigger: "longest contiguous stretch satisfying a constraint" → variable-size sliding ' +
        'window.',
      'Edge cases: empty string, all identical characters, all distinct, a single space.'
    ]
  },
  logEntry: {
    title: 'LC 3 — Longest Substring Without Repeating Characters',
    trigger: 'longest contiguous stretch satisfying a constraint',
    missed: 'the left pointer only ever moves forward — jump it via the last-seen-index map',
    family: 'variable-size sliding window',
    reuseIn: 'Minimum Window Substring, Longest Repeating Character Replacement, Fruit Into Baskets'
  }
};
