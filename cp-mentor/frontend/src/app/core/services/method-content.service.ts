import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MethodPhaseDTO {
  orderIndex: number; name: string; purpose: string; timeBudgetMinutes: number;
  whatToWriteDown: string; failureModePrevented: string;
}
export interface ComplexityBudgetDTO {
  orderIndex: number; maxNLabel: string; targetComplexity: string; techniques: string[];
}
export interface OptimizationMoveDTO {
  code: string; name: string; triggerQuestion: string; triggerPhrase: string;
  techniques: string[]; exampleProblems: string[];
}
export interface StuckRungDTO {
  rung: number; name: string; description: string; timeBudgetMinutes: number; costOfSkipping: string;
}
export interface RecoveryStepDTO { orderIndex: number; name: string; description: string; }
export interface AntiTriggerDTO { antiTriggerPhrase: string; misleadsToPatternSlug: string; }
export interface TriggerPhraseDTO {
  phrase: string; patternSlug: string; confidence: number; antiTriggers: AntiTriggerDTO[];
}
export interface TopicPriorityDTO {
  rank: number; name: string; estimatedHours: number; interviewFrequency: number; prerequisiteTopics: string[];
}
export interface InterviewScriptStepDTO { orderIndex: number; name: string; description: string; }
export interface CompanyFrequencyDTO { company: string; count: number; }

// Phase E — all public, cached reference-content reads. No standalone page
// consumes these yet (deeper integration — gating the solve-session stepper
// by StuckRung timers, the mandatory RecoveryStep checklist at hint level 4,
// InterviewScript on the completion screen — is deferred, not built this
// round; see CLAUDE.md). This service exists so that integration work has
// somewhere to start from without re-deriving the API shapes.
@Injectable({ providedIn: 'root' })
export class MethodContentService {
  private API = '/api/v1/method';
  constructor(private http: HttpClient) {}

  getPhases(): Observable<MethodPhaseDTO[]> { return this.http.get<MethodPhaseDTO[]>(`${this.API}/phases`); }
  getComplexityBudget(): Observable<ComplexityBudgetDTO[]> { return this.http.get<ComplexityBudgetDTO[]>(`${this.API}/complexity-budget`); }
  getMoves(): Observable<OptimizationMoveDTO[]> { return this.http.get<OptimizationMoveDTO[]>(`${this.API}/moves`); }
  getRungs(): Observable<StuckRungDTO[]> { return this.http.get<StuckRungDTO[]>(`${this.API}/rungs`); }
  getRecoverySteps(): Observable<RecoveryStepDTO[]> { return this.http.get<RecoveryStepDTO[]>(`${this.API}/recovery-steps`); }
  getTopics(): Observable<TopicPriorityDTO[]> { return this.http.get<TopicPriorityDTO[]>(`${this.API}/topics`); }
  getScript(): Observable<InterviewScriptStepDTO[]> { return this.http.get<InterviewScriptStepDTO[]>(`${this.API}/script`); }

  searchTriggerDictionary(q?: string): Observable<TriggerPhraseDTO[]> {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.http.get<TriggerPhraseDTO[]>(`${this.API}/triggers/dictionary${query}`);
  }

  getCompanyFrequency(patternSlug: string): Observable<CompanyFrequencyDTO[]> {
    return this.http.get<CompanyFrequencyDTO[]>(`${this.API}/patterns/${patternSlug}/company-frequency`);
  }
}
