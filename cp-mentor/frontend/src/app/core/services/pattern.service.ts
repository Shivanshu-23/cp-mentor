import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PatternCategory =
  'ARRAY' | 'STRING' | 'LINKED_LIST' | 'TREE' | 'GRAPH' | 'DP' | 'GREEDY' | 'MATH' | 'DESIGN';

export interface PatternSummary {
  id: number;
  slug: string;
  name: string;
  category: PatternCategory;
  intuition: string;
  recognitionTriggers: string[];
  difficultyToLearn: number; // 1-5
  frequencyScore: number;    // 1-5
}

export interface PatternDetail extends PatternSummary {
  antiTriggers: string[];
  javaTemplate: string;
  timeComplexity: string;
  spaceComplexity: string;
  whyComplexityIsNotObvious: string;
  commonMistakes: string[];
  edgeCaseChecklist: string[];
  variants: string;
  interviewFollowUps: string[];
  relatedPatterns: string[]; // slugs
}

export interface PatternProblem {
  id: number;
  patternSlug: string;
  leetcodeId: string;
  title: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  striverStep: string | null;
  role: 'INTRO' | 'CORE' | 'VARIANT' | 'HARD';
  orderIndex: number;
}

export interface MethodResource {
  id: number;
  patternSlug: string | null; // null = global
  title: string;
  url: string;
  type: 'SHEET' | 'VIDEO' | 'ARTICLE' | 'VISUALIZER' | 'PRACTICE';
  provider: string;
}

export interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; }

export interface PatternCandidate {
  patternSlug: string;
  confidence: number;
  matchedTriggers: string[];
  whyItFits: string;
  whyItMightNotFit: string;
}

export interface PatternIdentificationResult {
  candidates: PatternCandidate[];
  suggestedBruteForce: string;
  bottleneckQuestion: string;
}

export interface HintRequestPayload {
  problemStatement: string;
  problemIdentifier?: string;
  level: number;
  previousHints?: string[];
  patternSlug?: string | null;
  confirmLevel4?: boolean;
}

export interface HintResult {
  level: number;
  hint: string;
  containsCode: boolean;
  matchedPatternSlug: string | null;
}

@Injectable({ providedIn: 'root' })
export class PatternService {
  private API = '/api/v1/method';
  constructor(private http: HttpClient) {}

  identifyPattern(problemStatement: string, constraints?: string): Observable<PatternIdentificationResult> {
    return this.http.post<PatternIdentificationResult>(`${this.API}/identify-pattern`, { problemStatement, constraints });
  }

  getHint(payload: HintRequestPayload): Observable<HintResult> {
    return this.http.post<HintResult>(`${this.API}/hint`, payload);
  }

  getPatterns(category?: PatternCategory, page = 0, size = 100): Observable<PageResponse<PatternSummary>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (category) params.set('category', category);
    return this.http.get<PageResponse<PatternSummary>>(`${this.API}/patterns?${params}`);
  }

  getPattern(slug: string): Observable<PatternDetail> {
    return this.http.get<PatternDetail>(`${this.API}/patterns/${slug}`);
  }

  getPatternProblems(slug: string): Observable<PatternProblem[]> {
    return this.http.get<PatternProblem[]>(`${this.API}/patterns/${slug}/problems`);
  }

  getResources(patternSlug?: string): Observable<MethodResource[]> {
    const params = patternSlug ? `?patternSlug=${encodeURIComponent(patternSlug)}` : '';
    return this.http.get<MethodResource[]>(`${this.API}/resources${params}`);
  }
}
