// Dependency-free subsequence fuzzy match — per the brief's "build it; do not
// pull in a heavyweight dependency" rule for the command palette.
// Returns -1 when the query's characters don't all appear in target, in
// order. Otherwise returns a score rewarding consecutive/early matches.
export function fuzzyScore(query: string, target: string): number {
  if (!query.trim()) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  let qi = 0;
  let score = 0;
  let consecutive = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 10 + consecutive * 5 - ti * 0.05;
      consecutive++;
      qi++;
    } else {
      consecutive = 0;
    }
  }

  return qi === q.length ? score : -1;
}
