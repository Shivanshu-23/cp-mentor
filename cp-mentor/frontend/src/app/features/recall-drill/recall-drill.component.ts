import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TriggerService, TriggerEntryResponse, ReviewResult } from '../../core/services/trigger.service';

@Component({
  selector: 'app-recall-drill',
  templateUrl: './recall-drill.component.html',
  styleUrls: ['./recall-drill.component.scss']
})
export class RecallDrillComponent implements OnInit {

  dueEntries: TriggerEntryResponse[] = [];
  loading = true;
  revealed: Record<number, boolean> = {};
  recalledAnswer: Record<number, string> = {};
  grading: Record<number, boolean> = {};

  // The one confetti burst the design brief allows: completing a full
  // drill with all PASS. Tracked per session, not persisted.
  private sessionResults: ReviewResult[] = [];
  private drillHadEntries = false;

  // Manual "log a trigger" form
  showLogForm = false;
  leetcodeId = '';
  title = '';
  trigger = '';
  missedObservation = '';
  patternSlug = '';

  constructor(
    private triggerService: TriggerService,
    private snack: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadDue();

    const params = this.route.snapshot.queryParamMap;
    const leetcodeId = params.get('leetcodeId');
    if (leetcodeId) {
      this.leetcodeId = leetcodeId;
      this.title = params.get('title') ?? '';
      this.patternSlug = params.get('patternSlug') ?? '';
      this.showLogForm = true;
    }
  }

  loadDue(): void {
    this.loading = true;
    this.triggerService.due().subscribe({
      next: entries => {
        this.dueEntries = entries;
        this.drillHadEntries = entries.length > 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load today\'s drill', '', { duration: 3000 });
      }
    });
  }

  reveal(id: number): void {
    this.revealed[id] = true;
  }

  grade(entry: TriggerEntryResponse, result: ReviewResult): void {
    this.grading[entry.id] = true;
    this.triggerService.review(entry.id, result).subscribe({
      next: () => {
        this.dueEntries = this.dueEntries.filter(e => e.id !== entry.id);
        this.grading[entry.id] = false;
        this.sessionResults.push(result);
        const label = result === 'PASS' ? 'Nice — pushed further out' : result === 'FAIL' ? 'Reset to day 2' : 'Deferred to tomorrow';
        this.snack.open(label, '', { duration: 2000 });

        if (this.drillHadEntries && this.dueEntries.length === 0 && this.sessionResults.every(r => r === 'PASS')) {
          this.fireConfetti();
        }
      },
      error: () => {
        this.grading[entry.id] = false;
        this.snack.open('Failed to submit review', '', { duration: 3000 });
      }
    });
  }

  logTrigger(): void {
    if (!this.leetcodeId.trim() || !this.title.trim() || !this.trigger.trim()) {
      this.snack.open('LeetCode ID, title, and trigger are required', '', { duration: 2500 });
      return;
    }
    this.triggerService.create({
      leetcodeId: this.leetcodeId.trim(),
      title: this.title.trim(),
      trigger: this.trigger.trim(),
      missedObservation: this.missedObservation.trim() || undefined,
      patternSlug: this.patternSlug.trim() || undefined
    }).subscribe({
      next: () => {
        this.snack.open('Trigger logged — first review in 2 days', '', { duration: 2500 });
        this.leetcodeId = this.title = this.trigger = this.missedObservation = this.patternSlug = '';
        this.showLogForm = false;
      },
      error: () => this.snack.open('Failed to log trigger', '', { duration: 3000 })
    });
  }

  // Hand-built, no library — a handful of coloured spans with randomised
  // trajectories via inline CSS custom properties, self-removing after the
  // animation ends. See recall-drill.component.scss for the keyframes.
  private fireConfetti(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const colors = ['#c7f284', '#5eead4', '#4ade80', '#fbbf24'];
    const container = document.createElement('div');
    container.className = 'confetti-burst';
    document.body.appendChild(container);

    for (let i = 0; i < 24; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--x', `${(Math.random() - 0.5) * 320}px`);
      piece.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
      piece.style.setProperty('--delay', `${Math.random() * 150}ms`);
      piece.style.left = `${45 + Math.random() * 10}%`;
      piece.style.background = colors[i % colors.length];
      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 1600);
  }

  stageLabel(stage: number): string {
    return ['Learning (2-day cycle)', 'Reviewing (7-day cycle)', 'Reviewing (21-day cycle)', 'Retired'][stage] ?? `Stage ${stage}`;
  }
}
