import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type MasteryTier = 'LEARNING' | 'FAMILIAR' | 'SOLID' | 'MASTERED';

export interface PatternMastery { patternSlug: string; tier: MasteryTier; passCount: number; anyRetired: boolean; }
export interface SubmissionsTrendPoint { weekLabel: string; avgSubmissions: number; }
export interface SubmissionsPerAccepted { current: number; target: number; trend: SubmissionsTrendPoint[]; }
export interface MasteryResponse {
  recallStreak: number;
  patternMastery: PatternMastery[];
  submissionsPerAccepted: SubmissionsPerAccepted;
}

@Injectable({ providedIn: 'root' })
export class MasteryService {
  private API = '/api/v1/stats';
  constructor(private http: HttpClient) {}

  getMastery(): Observable<MasteryResponse> {
    return this.http.get<MasteryResponse>(`${this.API}/mastery`);
  }

  // Blob response so the caller can hand it straight to an <img> object URL
  // or trigger a download — the endpoint itself is rate-limited server-side.
  getShareCard(): Observable<Blob> {
    return this.http.post(`${this.API}/share-card`, {}, { responseType: 'blob' });
  }
}
