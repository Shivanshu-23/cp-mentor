import { Trace } from '../model';

export interface TwoSumSortedInput { values: number[]; target: number; }

export const TWO_POINTER_CODE =
`int[] twoSumSorted(int[] a, int target) {
  int left = 0, right = a.length - 1;
  while (left < right) {
    int sum = a[left] + a[right];
    if (sum == target) return new int[]{left, right};
    if (sum < target) left++;
    else right--;
  }
  return new int[]{-1, -1};
}`;

export function generateTwoPointerTrace(input: TwoSumSortedInput): Trace {
  const a = [...input.values];
  const frames: Trace['frames'] = [];
  let step = 0;
  let left = 0, right = a.length - 1;

  frames.push({
    step: step++, explanation: `Array is sorted. Start left at 0 and right at the last index — the classic converging two-pointer setup.`,
    state: { values: a }, highlights: [], pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
    vars: { target: input.target }, codeLine: 1,
  });

  while (left < right) {
    const sum = a[left] + a[right];
    frames.push({
      step: step++, explanation: `a[left] + a[right] = ${a[left]} + ${a[right]} = ${sum}.`,
      state: { values: a },
      highlights: [{ kind: 'index', index: left, tone: 'compare' }, { kind: 'index', index: right, tone: 'compare' }],
      pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
      vars: { target: input.target, sum }, codeLine: 3,
    });

    if (sum === input.target) {
      frames.push({
        step: step++, explanation: `Match — ${sum} equals the target. Return [${left}, ${right}].`,
        state: { values: a },
        highlights: [{ kind: 'index', index: left, tone: 'answer' }, { kind: 'index', index: right, tone: 'answer' }],
        pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
        vars: { target: input.target, sum }, codeLine: 4,
      });
      return { structure: 'array', frames, code: TWO_POINTER_CODE };
    }

    if (sum < input.target) {
      left++;
      frames.push({
        step: step++, explanation: `${sum} is too small — moving left forward monotonically grows the sum.`,
        state: { values: a }, highlights: [], pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
        vars: { target: input.target, sum }, codeLine: 5,
      });
    } else {
      right--;
      frames.push({
        step: step++, explanation: `${sum} is too big — moving right backward monotonically shrinks the sum.`,
        state: { values: a }, highlights: [], pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
        vars: { target: input.target, sum }, codeLine: 6,
      });
    }
  }

  frames.push({
    step: step++, explanation: `Pointers crossed with no match found.`,
    state: { values: a }, highlights: [], pointers: [], vars: { target: input.target, result: 'none' }, codeLine: 8,
  });

  return { structure: 'array', frames, code: TWO_POINTER_CODE };
}

// ── Variable sliding window — "longest substring without repeating chars" ──
// The highest-value visualizer in the whole spec per the brief. Shown as an
// array of char codes so it reuses the array renderer's range highlight for
// the window band, with the frequency map surfaced in the variable rail.

export interface SlidingWindowInput { text: string; }

export const SLIDING_WINDOW_CODE =
`int longestUniqueSubstring(String s) {
  Map<Character,Integer> last = new HashMap<>();
  int left = 0, best = 0;
  for (int right = 0; right < s.length(); right++) {
    char c = s.charAt(right);
    if (last.containsKey(c) && last.get(c) >= left) {
      left = last.get(c) + 1;
    }
    last.put(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`;

export function generateSlidingWindowTrace(input: SlidingWindowInput): Trace {
  const s = input.text;
  const values = s.split('');
  const frames: Trace['frames'] = [];
  let step = 0;

  const last = new Map<string, number>();
  let left = 0, best = 0;

  frames.push({
    step: step++, explanation: `Grow the window with "right"; shrink it from the left the moment a repeat appears inside the window.`,
    state: { values }, highlights: [], pointers: [{ name: 'left', index: 0 }],
    vars: { window: s[0] ?? '', best }, codeLine: 2,
  });

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (last.has(c) && last.get(c)! >= left) {
      const newLeft = last.get(c)! + 1;
      frames.push({
        step: step++, explanation: `'${c}' already appears inside the current window at index ${last.get(c)} — shrink left to ${newLeft}.`,
        state: { values },
        highlights: [{ kind: 'range', from: left, to: right, tone: 'compare' }, { kind: 'index', index: last.get(c)!, tone: 'compare' }],
        pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
        vars: { window: s.slice(left, right + 1), best }, codeLine: 5,
      });
      left = newLeft;
    }
    last.set(c, right);
    best = Math.max(best, right - left + 1);

    frames.push({
      step: step++, explanation: `Window is now "${s.slice(left, right + 1)}" (length ${right - left + 1}). Best so far: ${best}.`,
      state: { values },
      highlights: [{ kind: 'range', from: left, to: right, tone: 'active' }],
      pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
      vars: { window: s.slice(left, right + 1), best }, codeLine: 8,
    });
  }

  frames.push({
    step: step++, explanation: `Scanned the whole string. Longest run of unique characters: ${best}.`,
    state: { values }, highlights: [], pointers: [], vars: { best }, codeLine: 10,
  });

  return { structure: 'array', frames, code: SLIDING_WINDOW_CODE };
}

// ── Container With Most Water — converging two pointer, but the invariant
// that lets you discard a side is different from the pair-sum case above:
// here it's "the shorter wall is always the bottleneck," not sum vs target.

export interface ContainerWaterInput { heights: number[]; }

export const CONTAINER_WATER_CODE =
`int maxArea(int[] height) {
  int left = 0, right = height.length - 1, best = 0;
  while (left < right) {
    int h = Math.min(height[left], height[right]);
    best = Math.max(best, h * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}`;

export function generateContainerWaterTrace(input: ContainerWaterInput): Trace {
  const heights = [...input.heights];
  const frames: Trace['frames'] = [];
  let step = 0;
  let left = 0, right = heights.length - 1, best = 0, bestLeft = 0, bestRight = heights.length - 1;

  frames.push({
    step: step++, explanation: `Two walls converging from the outside in. Area is bounded by the SHORTER wall — that's the pointer that has to move.`,
    state: { values: heights }, highlights: [], pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
    vars: { best }, codeLine: 1,
  });

  while (left < right) {
    const h = Math.min(heights[left], heights[right]);
    const area = h * (right - left);
    const improved = area > best;
    if (improved) { best = area; bestLeft = left; bestRight = right; }

    frames.push({
      step: step++, explanation: `min(${heights[left]}, ${heights[right]}) × width ${right - left} = ${area}.${improved ? ` New best.` : ''}`,
      state: { values: heights },
      highlights: [
        { kind: 'index', index: left, tone: 'compare' }, { kind: 'index', index: right, tone: 'compare' },
        ...(improved ? [{ kind: 'range' as const, from: bestLeft, to: bestRight, tone: 'answer' as const }] : []),
      ],
      pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
      vars: { area, best }, codeLine: 5,
    });

    if (heights[left] < heights[right]) {
      left++;
      frames.push({
        step: step++, explanation: `Left wall (${heights[left - 1]}) is shorter than right (${heights[right]}) — it's the bottleneck, so it's the one that might find something taller.`,
        state: { values: heights }, highlights: [], pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
        vars: { best }, codeLine: 6,
      });
    } else {
      right--;
      frames.push({
        step: step++, explanation: `Right wall (${heights[right + 1]}) is the bottleneck (or tied) — move it instead.`,
        state: { values: heights }, highlights: [], pointers: [{ name: 'left', index: left }, { name: 'right', index: right }],
        vars: { best }, codeLine: 7,
      });
    }
  }

  frames.push({
    step: step++, explanation: `Pointers met. Best area found: ${best}, between indices ${bestLeft} and ${bestRight}.`,
    state: { values: heights },
    highlights: [{ kind: 'range', from: bestLeft, to: bestRight, tone: 'answer' }],
    pointers: [], vars: { best }, codeLine: 9,
  });

  return { structure: 'array', frames, code: CONTAINER_WATER_CODE };
}
