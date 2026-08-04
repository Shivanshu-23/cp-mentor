import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PatternCategory } from '../../core/services/pattern.service';
import { Pattern, PATTERNS } from '@content';
import { TiltDirective } from '../../shared/tilt.directive';
import { BookmarkService, BookmarkResponse } from '../../core/services/bookmark.service';
import { AuthService } from '../../core/services/auth.service';
import { SolveSessionService } from '../../core/services/solve-session.service';
import { PATTERN_PROBLEMS_BY_SLUG } from '@content';

// Sourced from the frontend-static content layer (src/app/content/patterns),
// not an HTTP call — the Pattern Library is reference data, so it should
// render instantly, work offline, and prerender to real HTML without a
// backend round-trip. See CLAUDE.md "Frontend-Static Content Layer".
@Component({
  selector: 'app-pattern-library',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, TiltDirective],
  templateUrl: './pattern-library.component.html',
  styleUrls: ['./pattern-library.component.scss']
})
export class PatternLibraryComponent implements OnInit {

  patterns: Pattern[] = [];
  loading = true;

  searchTerm = '';
  selectedCategory: PatternCategory | 'all' = 'all';

  categories: (PatternCategory | 'all')[] = [
    'all', 'ARRAY', 'STRING', 'LINKED_LIST', 'TREE', 'GRAPH', 'DP', 'GREEDY', 'MATH', 'DESIGN'
  ];

  private categoryLabels: Record<string, string> = {
    all: 'All Categories',
    ARRAY: 'Array', STRING: 'String', LINKED_LIST: 'Linked List', TREE: 'Tree',
    GRAPH: 'Graph', DP: 'Dynamic Programming', GREEDY: 'Greedy', MATH: 'Math', DESIGN: 'Design'
  };

  private reducedMotion = false;

  // slug -> bookmark id, only populated for logged-in users. A Set would be
  // enough for "is this bookmarked" but keeping the id lets the toggle
  // button call delete(id) directly without a lookup round-trip.
  bookmarkedPatternIds: Record<string, number> = {};

  // Grid (existing) vs Roadmap — patterns grouped by category with a
  // per-pattern completion indicator. Original layout: grouped sections with
  // a progress bar per node, not modeled on any specific external site.
  viewMode: 'grid' | 'roadmap' = 'grid';
  private completedLeetcodeIds = new Set<string>();

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private bookmarkService: BookmarkService,
    private solveSessionService: SolveSessionService,
    public auth: AuthService
  ) {
    if (isPlatformBrowser(platformId)) {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  // Subtle mouse-parallax on the header web motif — the whole group drifts a
  // few px opposite the cursor via CSS custom properties consumed by
  // .web-parallax's transform (see pattern-library.component.scss). Kept
  // separate from .web-anchor's own sway rotation so the two transforms
  // never fight over the same declaration.
  onWebMotifMouseMove(event: MouseEvent): void {
    if (this.reducedMotion) return;
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    svg.style.setProperty('--parallax-x', String(-x * 12));
    svg.style.setProperty('--parallax-y', String(-y * 8));
  }

  onWebMotifMouseLeave(event?: MouseEvent): void {
    const svg = event?.currentTarget as SVGSVGElement | undefined;
    svg?.style.setProperty('--parallax-x', '0');
    svg?.style.setProperty('--parallax-y', '0');
  }

  ngOnInit(): void {
    this.loadPatterns();
    if (this.auth.isLoggedIn()) {
      this.bookmarkService.listMine().subscribe({
        next: bookmarks => {
          for (const b of bookmarks) {
            if (b.itemType === 'PATTERN') this.bookmarkedPatternIds[b.itemKey] = b.id;
          }
        },
        error: () => {} // bookmark stars are a nice-to-have, don't block the page on it
      });
      // "Completed" mirrors PracticeQueueService's own definition on the
      // backend (endedAt set), not TriggerEntry existence — kept consistent
      // across every "have I solved this" signal in the app. size=200 is a
      // pragmatic ceiling for a personal collection rather than paginating
      // through every session just to build a progress ring.
      this.solveSessionService.list(0, 200).subscribe({
        next: page => {
          for (const s of page.content) {
            if (s.endedAt) this.completedLeetcodeIds.add(s.leetcodeId);
          }
        },
        error: () => {} // roadmap progress is a nice-to-have too
      });
    }
  }

  setViewMode(mode: 'grid' | 'roadmap'): void {
    this.viewMode = mode;
  }

  patternsByCategory(): { category: PatternCategory; patterns: Pattern[] }[] {
    const groups = new Map<PatternCategory, Pattern[]>();
    for (const p of this.filteredPatterns) {
      if (!groups.has(p.category)) groups.set(p.category, []);
      groups.get(p.category)!.push(p);
    }
    return Array.from(groups.entries())
      .map(([category, patterns]) => ({
        category,
        patterns: patterns.sort((a, b) => a.difficultyToLearn - b.difficultyToLearn)
      }));
  }

  patternProgress(slug: string): { solved: number; total: number; percent: number } {
    const problems = PATTERN_PROBLEMS_BY_SLUG[slug] ?? [];
    const total = problems.length;
    const solved = problems.filter(p => this.completedLeetcodeIds.has(p.leetcodeId)).length;
    return { solved, total, percent: total ? Math.round((solved / total) * 100) : 0 };
  }

  isBookmarked(slug: string): boolean {
    return slug in this.bookmarkedPatternIds;
  }

  toggleBookmark(event: MouseEvent, pattern: Pattern): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.auth.isLoggedIn()) return;

    const existingId = this.bookmarkedPatternIds[pattern.slug];
    if (existingId) {
      delete this.bookmarkedPatternIds[pattern.slug];
      this.bookmarkService.delete(existingId).subscribe({ error: () => { this.bookmarkedPatternIds[pattern.slug] = existingId; } });
    } else {
      this.bookmarkService.create({ itemType: 'PATTERN', itemKey: pattern.slug, title: pattern.name }).subscribe({
        next: b => { this.bookmarkedPatternIds[pattern.slug] = b.id; },
      });
    }
  }

  loadPatterns(): void {
    this.patterns = PATTERNS;
    this.loading = false;
  }

  get categoryCount(): number {
    return new Set(this.patterns.map(p => p.category)).size;
  }

  get filteredPatterns(): Pattern[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.patterns.filter(p => {
      const matchesCategory = this.selectedCategory === 'all' || p.category === this.selectedCategory;
      if (!matchesCategory) return false;
      if (!term) return true;
      const nameMatch = p.name.toLowerCase().includes(term);
      const triggerMatch = p.recognitionTriggers.some(t => t.toLowerCase().includes(term));
      return nameMatch || triggerMatch;
    });
  }

  private categoryIcons: Record<string, string> = {
    ARRAY: 'view_column', STRING: 'text_fields', LINKED_LIST: 'link', TREE: 'account_tree',
    GRAPH: 'hub', DP: 'table_chart', GREEDY: 'trending_up', MATH: 'functions', DESIGN: 'widgets'
  };

  categoryLabel(c: string): string {
    return this.categoryLabels[c] ?? c;
  }

  categoryIcon(c: string): string {
    return this.categoryIcons[c] ?? 'lightbulb';
  }

  difficultyStars(n: number): string {
    return '●'.repeat(n) + '○'.repeat(5 - n);
  }
}
