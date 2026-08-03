import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EdgeCaseInputType = 'ARRAY' | 'STRING' | 'TREE' | 'GRAPH' | 'MATRIX' | 'NUMBER';

export interface ConstraintAnalysisRequest {
  n: number;
  sorted?: boolean;
  negativesAllowed?: boolean;
  duplicatesAllowed?: boolean;
  valuesBounded?: boolean;
  maxValue?: number | null;
}

export interface ConstraintAnalysisResponse {
  targetComplexity: string;
  candidateTechniques: string[];
  overflowWarning: string | null;
}

export interface EdgeCaseRequest {
  inputType: EdgeCaseInputType;
  sorted?: boolean;
  negativesAllowed?: boolean;
  duplicatesAllowed?: boolean;
  valuesBounded?: boolean;
  patternSlug?: string | null;
}

export interface EdgeCaseResponse {
  checklist: string[];
}

@Injectable({ providedIn: 'root' })
export class ConstraintAnalyzerService {
  private API = '/api/v1/method';
  constructor(private http: HttpClient) {}

  analyzeConstraints(req: ConstraintAnalysisRequest): Observable<ConstraintAnalysisResponse> {
    return this.http.post<ConstraintAnalysisResponse>(`${this.API}/analyze-constraints`, req);
  }

  generateEdgeCases(req: EdgeCaseRequest): Observable<EdgeCaseResponse> {
    return this.http.post<EdgeCaseResponse>(`${this.API}/edge-cases`, req);
  }
}
