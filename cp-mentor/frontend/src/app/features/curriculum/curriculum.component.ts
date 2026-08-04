import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MethodContentService, TopicPriorityDTO } from '../../core/services/method-content.service';

// Surfaces Phase E's 35-topic priority curriculum (TopicPriority, seeded,
// already had an endpoint) which — per CLAUDE.md — never got a consumer
// page. Completion is tracked client-side only (localStorage): these are
// broad study topics, not per-problem solve data, so there's no existing
// backend record of "have I learned two-pointer yet" to hang this off of,
// and adding one would be new schema for what's fundamentally a personal
// checklist, not shared/cross-device-critical data.
@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './curriculum.component.html',
  styleUrl: './curriculum.component.scss'
})
export class CurriculumComponent implements OnInit {
  private readonly STORAGE_KEY = 'drona_curriculum_done_v1';
  private readonly isBrowser: boolean;

  topics: TopicPriorityDTO[] = [];
  loading = true;
  done: Record<number, boolean> = {};

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private methodContentService: MethodContentService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) this.loadDone();
    this.methodContentService.getTopics().subscribe({
      next: topics => {
        this.topics = topics;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  toggleDone(rank: number): void {
    this.done[rank] = !this.done[rank];
    if (this.isBrowser) localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.done));
  }

  private loadDone(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return;
    try { this.done = JSON.parse(raw); } catch { /* corrupt draft — ignore, start fresh */ }
  }

  get doneCount(): number {
    return this.topics.filter(t => this.done[t.rank]).length;
  }

  get progressPercent(): number {
    return this.topics.length ? Math.round((this.doneCount / this.topics.length) * 100) : 0;
  }

  frequencyStars(freq: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < freq);
  }
}
