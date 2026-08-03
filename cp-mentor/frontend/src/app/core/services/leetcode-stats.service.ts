import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DayCount { date: string; count: number; }
export interface RecentSubmission { title: string; url: string; timestamp: number; }

export interface LeetCodeStats {
  username: string;
  profileUrl: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: number;
  totalActiveDays: number;
  solvedToday: number;
  last7Days: DayCount[];
  recentSubmissions: RecentSubmission[];
}

@Injectable({ providedIn: 'root' })
export class LeetCodeStatsService {
  private API = '/api/v1/leetcode-stats';
  constructor(private http: HttpClient) {}

  getStats(): Observable<LeetCodeStats> {
    return this.http.get<LeetCodeStats>(this.API);
  }
}
