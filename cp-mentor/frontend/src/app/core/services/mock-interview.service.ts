import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RandomProblemResponse {
  leetcodeId: string;
  title: string;
  url: string;
  difficulty: string;
}

@Injectable({ providedIn: 'root' })
export class MockInterviewService {
  private API = '/api/v1/mock-interview';
  constructor(private http: HttpClient) {}

  randomProblem(difficulty?: string): Observable<RandomProblemResponse> {
    const params = difficulty ? `?difficulty=${encodeURIComponent(difficulty)}` : '';
    return this.http.get<RandomProblemResponse>(`${this.API}/random-problem${params}`);
  }
}
