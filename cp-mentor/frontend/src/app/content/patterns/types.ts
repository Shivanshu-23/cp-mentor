// Shared shape for the 25 seeded DSA patterns, mirrored from the backend's
// com.cpmentor.method.entity.Pattern / PatternProblem (see CLAUDE.md Phase 1).
// These are frontend-static copies of already-seeded, already-public data —
// not new content, just moved so the Pattern Library keeps working with the
// backend down, per the frontend-static content-layer decision.

export type PatternCategory = 'ARRAY' | 'STRING' | 'LINKED_LIST' | 'TREE' | 'GRAPH' | 'DP' | 'GREEDY' | 'MATH' | 'DESIGN';

export interface Pattern {
  slug: string;
  name: string;
  category: PatternCategory;
  intuition: string;
  recognitionTriggers: string[];
  antiTriggers: string[];
  javaTemplate: string;
  timeComplexity: string;
  spaceComplexity: string;
  whyComplexityIsNotObvious: string;
  commonMistakes: string[];
  edgeCaseChecklist: string[];
  variants: string;
  interviewFollowUps: string[];
  relatedPatterns: string[];
  difficultyToLearn: number;
  frequencyScore: number;
}

export interface PatternProblemRef {
  leetcodeId: string;
  title: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  role: 'INTRO' | 'CORE' | 'VARIANT' | 'HARD';
  orderIndex: number;
}
