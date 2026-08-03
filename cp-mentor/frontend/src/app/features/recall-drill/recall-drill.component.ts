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
        const label = result === 'PASS' ? 'Nice — pushed further out' : result === 'FAIL' ? 'Reset to day 2' : 'Deferred to tomorrow';
        this.snack.open(label, '', { duration: 2000 });
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

  stageLabel(stage: number): string {
    return ['Learning (2-day cycle)', 'Reviewing (7-day cycle)', 'Reviewing (21-day cycle)', 'Retired'][stage] ?? `Stage ${stage}`;
  }
}
