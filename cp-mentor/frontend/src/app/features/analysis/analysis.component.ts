import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProblemService, Problem, AIAnalysis, VideoDTO } from '../../core/services/problem.service';
import { forkJoin } from 'rxjs';

@Component({ selector: 'app-analysis', templateUrl: './analysis.component.html' })
export class AnalysisComponent implements OnInit {
  problem: Problem | null = null;
  analysis: AIAnalysis | null = null;
  videos: VideoDTO[] = [];
  loading = true;
  loadingVideos = false;
  videosLoaded = false;
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

  onTabChange(index: number): void {
    // Lazy-load videos only when Videos tab (index 4) is first opened
    if (index === 4 && !this.videosLoaded && this.problem) {
      this.loadVideos();
    }
  }

  loadVideos(): void {
    if (!this.problem) return;
    this.loadingVideos = true;

    // Use first topic, or problem title as fallback
    const topic = this.problem.topics?.[0] ?? this.problem.title;
    this.ps.getVideos(topic).subscribe({
      next: (vids) => {
        this.videos = vids;
        this.loadingVideos = false;
        this.videosLoaded = true;
      },
      error: () => {
        this.loadingVideos = false;
        this.videosLoaded = true;
        this.snack.open('Could not load videos', '', { duration: 3000 });
      }
    });
  }

  openVideo(url: string): void {
    window.open(url, '_blank', 'noopener');
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
