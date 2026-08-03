import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Move =
  'STORE_INSTEAD_OF_RECOMPUTE' | 'MONOTONIC_POINTER' | 'SORT_FIRST' |
  'ONLY_EXTREME_MATTERS' | 'BINARY_SEARCH_ANSWER' | 'NONE_FIRED';

export interface SolveSessionCreateRequest {
  leetcodeId: string;
  title: string;
  difficulty?: string;
}

export interface SolveSessionUpdateRequest {
  patternSlug?: string;
  submissionCount?: number;
  solvedUnaided?: boolean;
  highestHintLevel?: number;
  stuckRung?: number;
  constraintNotes?: string;
  targetComplexity?: string;
  restatement?: string;
  bruteForceIdea?: string;
  bruteForceComplexity?: string;
  handSolveNotes?: string;
  bottleneckStatement?: string;
  movesFired?: Move[];
  finalApproach?: string;
  finalComplexity?: string;
  edgeCasesChecked?: string[];
  codeSnapshot?: string;
}

export interface SolveSessionCompleteRequest {
  solvedUnaided?: boolean;
  stuckRung?: number;
}

export interface SolveSessionResponse {
  id: number;
  leetcodeId: string;
  title: string;
  difficulty: string | null;
  patternSlug: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  submissionCount: number;
  solvedUnaided: boolean;
  highestHintLevel: number;
  stuckRung: number | null;
  constraintNotes: string | null;
  targetComplexity: string | null;
  restatement: string | null;
  bruteForceIdea: string | null;
  bruteForceComplexity: string | null;
  handSolveNotes: string | null;
  bottleneckStatement: string | null;
  movesFired: Move[];
  finalApproach: string | null;
  finalComplexity: string | null;
  edgeCasesChecked: string[];
  codeSnapshot: string | null;
}

export interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }

@Injectable({ providedIn: 'root' })
export class SolveSessionService {
  private API = '/api/v1/method/sessions';
  constructor(private http: HttpClient) {}

  create(req: SolveSessionCreateRequest): Observable<SolveSessionResponse> {
    return this.http.post<SolveSessionResponse>(this.API, req);
  }

  update(id: number, req: SolveSessionUpdateRequest): Observable<SolveSessionResponse> {
    return this.http.patch<SolveSessionResponse>(`${this.API}/${id}`, req);
  }

  complete(id: number, req: SolveSessionCompleteRequest): Observable<SolveSessionResponse> {
    return this.http.post<SolveSessionResponse>(`${this.API}/${id}/complete`, req);
  }

  getById(id: number): Observable<SolveSessionResponse> {
    return this.http.get<SolveSessionResponse>(`${this.API}/${id}`);
  }

  list(page = 0, size = 20, difficulty?: string, solvedUnaided?: boolean): Observable<PageResponse<SolveSessionResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (difficulty) params.set('difficulty', difficulty);
    if (solvedUnaided !== undefined) params.set('solvedUnaided', String(solvedUnaided));
    return this.http.get<PageResponse<SolveSessionResponse>>(`${this.API}?${params}`);
  }
}
