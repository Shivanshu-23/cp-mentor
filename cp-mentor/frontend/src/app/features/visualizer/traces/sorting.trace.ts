import { Trace } from '../model';

export interface SortInput { values: number[]; }

export const SELECTION_SORT_CODE =
`void selectionSort(int[] a) {
  for (int i = 0; i < a.length - 1; i++) {
    int minIdx = i;
    for (int j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) minIdx = j;
    }
    swap(a, i, minIdx);
  }
}`;

// Selection sort was the only sort shipped in Phase C's first pass — merge
// and quick sort were added later (see below) once there was room; heap
// sort's dual-array/tree view is still a future extension, not built yet.
export function generateSelectionSortTrace(input: SortInput): Trace {
  const a = [...input.values];
  const frames: Trace['frames'] = [];
  let step = 0;

  frames.push({
    step: step++, explanation: `Selection sort: repeatedly find the minimum of the unsorted suffix and swap it to the front of that suffix.`,
    state: { values: [...a] }, highlights: [], pointers: [], vars: {}, codeLine: 1,
  });

  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    frames.push({
      step: step++, explanation: `Settled prefix is [0, ${i - 1}]. Scan [${i}, ${a.length - 1}] for the minimum.`,
      state: { values: [...a] },
      highlights: [{ kind: 'range', from: 0, to: i - 1, tone: 'settled' }, { kind: 'index', index: i, tone: 'compare' }],
      pointers: [{ name: 'min', index: minIdx }], vars: {}, codeLine: 2,
    });

    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) {
        minIdx = j;
        frames.push({
          step: step++, explanation: `a[${j}] = ${a[j]} is smaller than the current minimum (a[${minIdx === j ? i : minIdx}]) — new minimum candidate.`,
          state: { values: [...a] },
          highlights: [{ kind: 'range', from: 0, to: i - 1, tone: 'settled' }, { kind: 'index', index: j, tone: 'active' }],
          pointers: [{ name: 'min', index: minIdx }], vars: {}, codeLine: 5,
        });
      }
    }

    [a[i], a[minIdx]] = [a[minIdx], a[i]];
    frames.push({
      step: step++, explanation: `Swap the minimum (index ${minIdx}) into position ${i}. Prefix [0, ${i}] is now settled.`,
      state: { values: [...a] },
      highlights: [{ kind: 'range', from: 0, to: i, tone: 'settled' }],
      pointers: [], vars: {}, codeLine: 7,
    });
  }

  frames.push({
    step: step++, explanation: `Fully sorted.`,
    state: { values: [...a] }, highlights: [{ kind: 'range', from: 0, to: a.length - 1, tone: 'settled' }],
    pointers: [], vars: {}, codeLine: 0,
  });

  return { structure: 'array', frames, code: SELECTION_SORT_CODE };
}

export const MERGE_SORT_CODE =
`void mergeSort(int[] a, int lo, int hi) {
  if (lo >= hi) return;
  int mid = (lo + hi) / 2;
  mergeSort(a, lo, mid);
  mergeSort(a, mid + 1, hi);
  merge(a, lo, mid, hi);
}

void merge(int[] a, int lo, int mid, int hi) {
  int[] tmp = new int[hi - lo + 1];
  int i = lo, j = mid + 1, k = 0;
  while (i <= mid && j <= hi) {
    tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
  }
  while (i <= mid) tmp[k++] = a[i++];
  while (j <= hi) tmp[k++] = a[j++];
  System.arraycopy(tmp, 0, a, lo, tmp.length);
}`;

// Recursion is run for real (not simulated) and frames are pushed at the
// two points that matter: each split boundary, and each element chosen
// during a merge — the same "narrate the real algorithm" approach as
// selection sort, just with a call stack instead of two nested loops.
export function generateMergeSortTrace(input: SortInput): Trace {
  const a = [...input.values];
  const frames: Trace['frames'] = [];
  let step = 0;

  frames.push({
    step: step++, explanation: `Merge sort: split in half recursively down to single elements, then merge sorted halves back together.`,
    state: { values: [...a] }, highlights: [], pointers: [], vars: {}, codeLine: 1,
  });

  const merge = (lo: number, mid: number, hi: number): void => {
    const tmp: number[] = [];
    let i = lo, j = mid + 1;
    while (i <= mid && j <= hi) {
      frames.push({
        step: step++, explanation: `Compare a[${i}]=${a[i]} and a[${j}]=${a[j]} — the smaller one joins the merged run next.`,
        state: { values: [...a] },
        highlights: [{ kind: 'index', index: i, tone: 'compare' }, { kind: 'index', index: j, tone: 'compare' }],
        pointers: [{ name: 'i', index: i }, { name: 'j', index: j }], vars: {}, codeLine: 12,
      });
      if (a[i] <= a[j]) tmp.push(a[i++]); else tmp.push(a[j++]);
    }
    while (i <= mid) tmp.push(a[i++]);
    while (j <= hi) tmp.push(a[j++]);
    for (let k = 0; k < tmp.length; k++) a[lo + k] = tmp[k];

    frames.push({
      step: step++, explanation: `Merged [${lo}, ${hi}] — that whole range is now sorted.`,
      state: { values: [...a] },
      highlights: [{ kind: 'range', from: lo, to: hi, tone: 'settled' }],
      pointers: [], vars: {}, codeLine: 16,
    });
  };

  const mergeSort = (lo: number, hi: number): void => {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    frames.push({
      step: step++, explanation: `Split [${lo}, ${hi}] into [${lo}, ${mid}] and [${mid + 1}, ${hi}].`,
      state: { values: [...a] },
      highlights: [{ kind: 'range', from: lo, to: mid, tone: 'active' }, { kind: 'range', from: mid + 1, to: hi, tone: 'compare' }],
      pointers: [], vars: {}, codeLine: 3,
    });
    mergeSort(lo, mid);
    mergeSort(mid + 1, hi);
    merge(lo, mid, hi);
  };

  mergeSort(0, a.length - 1);

  frames.push({
    step: step++, explanation: `Fully sorted.`,
    state: { values: [...a] }, highlights: [{ kind: 'range', from: 0, to: a.length - 1, tone: 'settled' }],
    pointers: [], vars: {}, codeLine: 0,
  });

  return { structure: 'array', frames, code: MERGE_SORT_CODE };
}

export const QUICK_SORT_CODE =
`void quickSort(int[] a, int lo, int hi) {
  if (lo >= hi) return;
  int p = partition(a, lo, hi);
  quickSort(a, lo, p - 1);
  quickSort(a, p + 1, hi);
}

int partition(int[] a, int lo, int hi) {
  int pivot = a[hi];
  int i = lo;
  for (int j = lo; j < hi; j++) {
    if (a[j] < pivot) {
      swap(a, i, j);
      i++;
    }
  }
  swap(a, i, hi);
  return i;
}`;

// Lomuto partition scheme — pivot is always the last element of the current
// range, which keeps the visualization's "answer" highlight anchored to one
// spot per partition call instead of jumping around with a randomized pivot.
export function generateQuickSortTrace(input: SortInput): Trace {
  const a = [...input.values];
  const frames: Trace['frames'] = [];
  let step = 0;

  frames.push({
    step: step++, explanation: `Quick sort: pick a pivot, partition so everything smaller ends up left of it and everything larger ends up right, then recurse on both sides.`,
    state: { values: [...a] }, highlights: [], pointers: [], vars: {}, codeLine: 1,
  });

  const quickSort = (lo: number, hi: number): void => {
    if (lo > hi) return;
    if (lo === hi) {
      frames.push({
        step: step++, explanation: `Single element at index ${lo} — already in its final position.`,
        state: { values: [...a] }, highlights: [{ kind: 'index', index: lo, tone: 'settled' }],
        pointers: [], vars: {}, codeLine: 2,
      });
      return;
    }

    const pivotVal = a[hi];
    frames.push({
      step: step++, explanation: `Pivot = a[${hi}] = ${pivotVal}. Partition [${lo}, ${hi}] around it.`,
      state: { values: [...a] },
      highlights: [{ kind: 'index', index: hi, tone: 'answer' }, { kind: 'range', from: lo, to: hi - 1, tone: 'active' }],
      pointers: [], vars: { pivot: pivotVal }, codeLine: 9,
    });

    let i = lo;
    for (let j = lo; j < hi; j++) {
      const smaller = (a[j] as number) < (pivotVal as number);
      frames.push({
        step: step++, explanation: `a[${j}]=${a[j]} vs pivot ${pivotVal}${smaller ? ' — smaller, swap into the low side' : ' — not smaller, leave it where it is'}.`,
        state: { values: [...a] },
        highlights: [{ kind: 'index', index: j, tone: 'compare' }, { kind: 'index', index: hi, tone: 'answer' }],
        pointers: [{ name: 'i', index: i }, { name: 'j', index: j }], vars: { pivot: pivotVal }, codeLine: 11,
      });
      if (smaller) {
        [a[i], a[j]] = [a[j], a[i]];
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    frames.push({
      step: step++, explanation: `Pivot swapped into its final sorted position, index ${i}.`,
      state: { values: [...a] },
      highlights: [{ kind: 'index', index: i, tone: 'settled' }],
      pointers: [], vars: {}, codeLine: 15,
    });

    quickSort(lo, i - 1);
    quickSort(i + 1, hi);
  };

  quickSort(0, a.length - 1);

  frames.push({
    step: step++, explanation: `Fully sorted.`,
    state: { values: [...a] }, highlights: [{ kind: 'range', from: 0, to: a.length - 1, tone: 'settled' }],
    pointers: [], vars: {}, codeLine: 0,
  });

  return { structure: 'array', frames, code: QUICK_SORT_CODE };
}
