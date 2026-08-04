import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SolveSessionService, SolveSessionResponse } from '../../core/services/solve-session.service';

@Component({
  selector: 'app-solve-session-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
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
    // Loose inequality deliberately — the backend's Jackson config omits
    // null fields from the JSON response entirely (default-property-
    // inclusion: non_null, see CLAUDE.md), so an incomplete session's
    // endedAt arrives as `undefined`, not `null`. A strict `!== null`
    // check treats undefined as "not null" and wrongly reports the
    // session as complete; `!= null` catches both.
    return session.endedAt != null;
  }

  deleteSession(event: MouseEvent, session: SolveSessionResponse): void {
    event.stopPropagation();
    if (!confirm(`Delete "${session.title}"? This can't be undone.`)) return;

    this.solveSessionService.delete(session.id).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== session.id);
        this.totalElements--;
        this.snack.open('Session deleted', '', { duration: 2000 });
      },
      error: () => this.snack.open('Failed to delete session', '', { duration: 3000 })
    });
  }

  formatDuration(seconds: number | null): string {
    // Same null-vs-undefined gotcha as isComplete() above — loose equality
    // is deliberate here too.
    if (seconds == null) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadSessions(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadSessions(); } }
}
