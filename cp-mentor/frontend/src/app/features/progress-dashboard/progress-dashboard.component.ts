import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TriggerService, StatsResponse, TriggerEntryResponse } from '../../core/services/trigger.service';
import { MasteryService, MasteryResponse, MasteryTier } from '../../core/services/mastery.service';

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss']
})
export class ProgressDashboardComponent implements OnInit {

  stats: StatsResponse | null = null;
  loading = true;

  triggerLog: TriggerEntryResponse[] = [];
  loadingLog = true;

  mastery: MasteryResponse | null = null;
  loadingMastery = true;
  sharingCard = false;

  constructor(
    private triggerService: TriggerService,
    private masteryService: MasteryService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.triggerService.getStats().subscribe({
      next: stats => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load progress stats', '', { duration: 3000 });
      }
    });

    this.triggerService.listAll().subscribe({
      next: entries => {
        this.triggerLog = entries;
        this.loadingLog = false;
      },
      error: () => this.loadingLog = false
    });

    this.masteryService.getMastery().subscribe({
      next: m => { this.mastery = m; this.loadingMastery = false; },
      error: () => { this.loadingMastery = false; }
    });
  }

  // MASTERED uses --accent-gold specifically (not the general accent) —
  // gold is reserved app-wide for genuine achievement moments only.
  tierColorVar(tier: MasteryTier): string {
    return { LEARNING: '--text-muted', FAMILIAR: '--state-warning', SOLID: '--state-success', MASTERED: '--accent-gold' }[tier] ?? '--text-muted';
  }

  maxTrendValue(): number {
    if (!this.mastery?.submissionsPerAccepted.trend.length) return 1;
    return Math.max(1, ...this.mastery.submissionsPerAccepted.trend.map(t => t.avgSubmissions));
  }

  shareCard(): void {
    this.sharingCard = true;
    this.masteryService.getShareCard().subscribe({
      next: blob => {
        this.sharingCard = false;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'novacode-stats.png';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.sharingCard = false;
        const msg = err.status === 429 ? 'Daily share-card limit reached — try again tomorrow.' : 'Could not generate the stat card.';
        this.snack.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  printTriggerLog(): void {
    window.print();
  }

  stageLabel(stage: number): string {
    return ['Learning (2-day cycle)', 'Reviewing (7-day cycle)', 'Reviewing (21-day cycle)', 'Retired'][stage] ?? `Stage ${stage}`;
  }

  get difficultyEntries(): { key: string; value: number }[] {
    if (!this.stats) return [];
    return Object.entries(this.stats.problemsSolvedByDifficulty).map(([key, value]) => ({ key, value }));
  }

  get totalSolved(): number {
    return this.difficultyEntries.reduce((sum, e) => sum + e.value, 0);
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  }

  trendIcon(trend: string): string {
    return { IMPROVING: 'trending_down', WORSENING: 'trending_up', STABLE: 'trending_flat', NOT_ENOUGH_DATA: 'help_outline' }[trend] ?? 'help_outline';
  }

  trendLabel(trend: string): string {
    return { IMPROVING: 'Getting faster', WORSENING: 'Slowing down', STABLE: 'Stable', NOT_ENOUGH_DATA: 'Not enough data yet' }[trend] ?? trend;
  }
}
