import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolveSessionService, SolveSessionResponse } from '../../core/services/solve-session.service';

@Component({
  selector: 'app-solve-session-list',
  templateUrl: './solve-session-list.component.html',
  styleUrls: ['./solve-session-list.component.scss']
})
export class SolveSessionListComponent implements OnInit {

  sessions: SolveSessionResponse[] = [];
  loading = true;
  creating = false;

  // New-session form
  leetcodeId = '';
  title = '';
  difficulty = 'Medium';
  difficulties = ['Easy', 'Medium', 'Hard'];

  page = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private solveSessionService: SolveSessionService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.solveSessionService.list(this.page, this.pageSize).subscribe({
      next: res => {
        this.sessions = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load solve sessions', '', { duration: 3000 });
      }
    });
  }

  startSession(): void {
    if (!this.leetcodeId.trim() || !this.title.trim()) {
      this.snack.open('Enter at least a LeetCode ID and title', '', { duration: 2500 });
      return;
    }
    this.creating = true;
    this.solveSessionService.create({
      leetcodeId: this.leetcodeId.trim(),
      title: this.title.trim(),
      difficulty: this.difficulty
    }).subscribe({
      next: session => {
        this.creating = false;
        this.router.navigate(['/solve', session.id]);
      },
      error: () => {
        this.creating = false;
        this.snack.open('Failed to start session', '', { duration: 3000 });
      }
    });
  }

  resume(session: SolveSessionResponse): void {
    this.router.navigate(['/solve', session.id]);
  }

  isComplete(session: SolveSessionResponse): boolean {
    return session.endedAt !== null;
  }

  formatDuration(seconds: number | null): string {
    if (seconds === null) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadSessions(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadSessions(); } }
}
