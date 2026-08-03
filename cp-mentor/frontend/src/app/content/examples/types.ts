// Shared shape for the worked examples (Parts 7-9 of the source document).
// Each example walks the same five phases so a reader sees the method recur.

export interface TriggerLogEntry {
  title: string;
  trigger: string;
  missed: string;
  family: string;
  reuseIn: string;
}

export interface WorkedExample {
  slug: string;
  title: string;
  leetcodeId: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  intro?: string;
  constraints: { raw: string; analysis: string };
  restateAndBruteForce: { body: string[] };
  handSolve: { body: string[] };
  bottleneck: { body: string[] };
  codeAndDryRun?: { body: string[] };
  followUp?: { body: string[] };
  javaGotcha?: { body: string[] };
  logEntry: TriggerLogEntry;
}
