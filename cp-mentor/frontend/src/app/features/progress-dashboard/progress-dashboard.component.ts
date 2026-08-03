import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TriggerService, StatsResponse } from '../../core/services/trigger.service';

@Component({
  selector: 'app-progress-dashboard',
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss']
})
export class ProgressDashboardComponent implements OnInit {

  stats: StatsResponse | null = null;
  loading = true;

  constructor(private triggerService: TriggerService, private snack: MatSnackBar) {}

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
