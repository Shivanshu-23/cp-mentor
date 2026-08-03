import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProblemService, Problem, AIAnalysis } from '../../core/services/problem.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {
  problem: Problem | null = null;
  analysis: AIAnalysis | null = null;
  loading = true;
  activeTab = 0;

  constructor(
    private route: ActivatedRoute,
    private ps: ProblemService,
    private snack: MatSnackBar,
    public location: Location
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      problem: this.ps.getProblemById(id),
      analysis: this.ps.analyzeWithAI(id)
    }).subscribe({
      next: ({ problem, analysis }) => {
        this.problem = problem;
        this.analysis = analysis;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load analysis', 'Close', { duration: 4000 });
      }
    });
  }

  diffClass(d: string): string { return d?.toLowerCase() ?? 'easy'; }

  get approaches() {
    if (!this.analysis) return [];
    return [
      { label: 'Brute Force', data: this.analysis.bruteForce,     color: '#f85149' },
      { label: 'Better',      data: this.analysis.betterApproach,  color: '#d29922' },
      { label: 'Optimal',     data: this.analysis.optimalApproach, color: '#3fb950' }
    ].filter(a => a.data);
  }
}
