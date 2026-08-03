import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ReviewResult = 'PASS' | 'FAIL' | 'SKIPPED';

export interface TriggerEntryCreateRequest {
  leetcodeId: string;
  title: string;
  trigger: string;
  missedObservation?: string;
  patternSlug?: string;
  reuseIn?: string[];
}

export interface TriggerEntryResponse {
  id: number;
  leetcodeId: string;
  title: string;
  trigger: string;
  missedObservation: string | null;
  patternSlug: string | null;
  reuseIn: string[];
  createdAt: string;
  reviewStage: number;
  nextReviewAt: string;
  lastReviewResult: ReviewResult | null;
  lastReviewedAt: string | null;
}

export interface StatsResponse {
  problemsSolvedByDifficulty: Record<string, number>;
  averageSolveTimeSecondsOverall: number;
  averageSolveTimeSecondsRecent: number;
  solveTimeTrend: 'IMPROVING' | 'WORSENING' | 'STABLE' | 'NOT_ENOUGH_DATA';
  averageSubmissionsPerProblem: number;
  unaidedSolveRatePercent: number;
  patternsMastered: number;
  weakPatterns: string[];
  triggersDueToday: number;
  retentionRatePercent: number;
}

@Injectable({ providedIn: 'root' })
export class TriggerService {
  private API = '/api/v1/method';
  constructor(private http: HttpClient) {}

  create(req: TriggerEntryCreateRequest): Observable<TriggerEntryResponse> {
    return this.http.post<TriggerEntryResponse>(`${this.API}/triggers`, req);
  }

  listAll(): Observable<TriggerEntryResponse[]> {
    return this.http.get<TriggerEntryResponse[]>(`${this.API}/triggers`);
  }

  due(): Observable<TriggerEntryResponse[]> {
    return this.http.get<TriggerEntryResponse[]>(`${this.API}/triggers/due`);
  }

  review(id: number, result: ReviewResult): Observable<TriggerEntryResponse> {
    return this.http.post<TriggerEntryResponse>(`${this.API}/triggers/${id}/review`, { result });
  }

  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.API}/stats`);
  }
}
