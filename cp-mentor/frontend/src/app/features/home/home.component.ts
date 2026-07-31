import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProblemService, Problem, PageResponse } from '../../core/services/problem.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  daily: Problem | null = null;
  problems: Problem[] = [];
  totalProblems = 0;
  page = 0;
  pageSize = 10;

  loadingDaily = true;
  loadingList = true;

  today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(
    private problemService: ProblemService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDaily();
    this.loadProblems();
  }

  loadDaily(): void {
    this.loadingDaily = true;
    this.problemService.getDailyProblem().subscribe({
      next: p => { this.daily = p; this.loadingDaily = false; },
      error: () => { this.loadingDaily = false; this.snackBar.open('Could not load daily problem', '', { duration: 3000 }); }
    });
  }

  loadProblems(): void {
    this.loadingList = true;
    this.problemService.getAllProblems(this.page, this.pageSize).subscribe({
      next: (res: PageResponse<Problem>) => {
        this.problems = res.content;
        this.totalProblems = res.totalElements;
        this.loadingList = false;
      },
      error: () => { this.loadingList = false; }
    });
  }

  analyze(id: number): void {
    this.router.navigate(['/analysis', id]);
  }

  difficultyClass(d: string): string {
    return d?.toLowerCase() ?? 'easy';
  }

  difficultyColor(d: string): string {
    const map: Record<string, string> = { EASY: '#3fb950', MEDIUM: '#d29922', HARD: '#f85149' };
    return map[d] ?? '#8b949e';
  }
}
