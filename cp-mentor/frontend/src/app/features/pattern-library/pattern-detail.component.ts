import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Pattern, PatternProblemRef, getPattern, PATTERN_PROBLEMS_BY_SLUG } from '@content';
import { findVisualizerSlugForPattern } from '../visualizer/visualizer-registry';

// Sourced from the frontend-static content layer, same reasoning as
// PatternLibraryComponent — see CLAUDE.md "Frontend-Static Content Layer".
@Component({
  selector: 'app-pattern-detail',
  templateUrl: './pattern-detail.component.html',
  styleUrls: ['./pattern-detail.component.scss']
})
export class PatternDetailComponent implements OnInit {
  pattern: Pattern | null = null;
  problems: PatternProblemRef[] = [];
  loading = true;
  activeTab = 0;
  visualizerSlug: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    public location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) this.load(slug);
    });
  }

  load(slug: string): void {
    this.loading = true;
    this.activeTab = 0;
    const pattern = getPattern(slug);
    if (!pattern) {
      this.loading = false;
      this.snack.open('Pattern not found', 'Close', { duration: 4000 });
      return;
    }
    this.pattern = pattern;
    this.problems = PATTERN_PROBLEMS_BY_SLUG[slug] ?? [];
    this.visualizerSlug = findVisualizerSlugForPattern(pattern.slug) ?? null;
    this.loading = false;
  }

  codeLines(code: string): string[] {
    return code ? code.split('\n') : [];
  }

  copyTemplate(): void {
    if (!this.pattern?.javaTemplate) return;
    navigator.clipboard.writeText(this.pattern.javaTemplate).then(() => {
      this.snack.open('Template copied to clipboard', '', { duration: 1500 });
    });
  }

  roleLabel(role: string): string {
    return { INTRO: 'Intro', CORE: 'Core', VARIANT: 'Variant', HARD: 'Hard' }[role] ?? role;
  }

  diffClass(d: string): string {
    return d?.toLowerCase() ?? 'easy';
  }

  categoryLabel(c: string): string {
    const labels: Record<string, string> = {
      ARRAY: 'Array', STRING: 'String', LINKED_LIST: 'Linked List', TREE: 'Tree',
      GRAPH: 'Graph', DP: 'Dynamic Programming', GREEDY: 'Greedy', MATH: 'Math', DESIGN: 'Design'
    };
    return labels[c] ?? c;
  }
}
