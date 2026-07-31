import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Problem {
  id: number; leetcodeId: string; title: string; slug: string;
  difficulty: 'EASY'|'MEDIUM'|'HARD'; description: string; constraints: string;
  topics: string[]; exampleInput: string; exampleOutput: string;
  leetcodeUrl: string; fetchedAt: string;
}
export interface Approach {
  name: string; idea: string; timeComplexity: string; spaceComplexity: string;
  pseudoCode: string; javaCode: string;
}
export interface AIAnalysis {
  problemId: number; problemTitle: string; problemSummary: string; recognizedPattern: string;
  requiredDataStructures: string[]; requiredAlgorithms: string[];
  easyExplanation: string; mediumExplanation: string; advancedExplanation: string;
  bruteForce: Approach; betterApproach: Approach; optimalApproach: Approach;
  commonMistakes: string[]; interviewTips: string; edgeCases: string[];
  dryRun: string; visualization: string; realWorldApplications: string[];
  companiesAsking: string[]; whenToUseThisAlgorithm: string; whenNotToUseThisAlgorithm: string;
  revisionNotes: string; relatedProblems: string[]; practiceOrder: string[];
  flashCards: string[]; modelUsed: string; fromCache: boolean;
}
export interface VideoDTO {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  url: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  topic: string;
  whitelisted: boolean;
}
export interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; }

@Injectable({ providedIn: 'root' })
export class ProblemService {
  private API = '/api/v1';
  constructor(private http: HttpClient) {}

  getDailyProblem(): Observable<Problem> {
    return this.http.get<Problem>(`${this.API}/problems/daily`);
  }
  getProblemById(id: number): Observable<Problem> {
    return this.http.get<Problem>(`${this.API}/problems/${id}`);
  }
  getAllProblems(page=0, size=20): Observable<PageResponse<Problem>> {
    return this.http.get<PageResponse<Problem>>(`${this.API}/problems?page=${page}&size=${size}`);
  }
  analyzeWithAI(id: number): Observable<AIAnalysis> {
    return this.http.get<AIAnalysis>(`${this.API}/ai/analyze/${id}`);
  }
  getVideos(topic: string): Observable<VideoDTO[]> {
    return this.http.get<VideoDTO[]>(`${this.API}/videos?topic=${encodeURIComponent(topic)}`);
  }
}
