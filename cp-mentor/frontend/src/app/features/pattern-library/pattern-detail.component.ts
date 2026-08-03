import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { PatternService, PatternDetail, PatternProblem } from '../../core/services/pattern.service';

@Component({
  selector: 'app-pattern-detail',
  templateUrl: './pattern-detail.component.html',
  styleUrls: ['./pattern-detail.component.scss']
})
export class PatternDetailComponent implements OnInit {
  pattern: PatternDetail | null = null;
  problems: PatternProblem[] = [];
  loading = true;
  activeTab = 0;

  constructor(
    private route: ActivatedRoute,
    private patternService: PatternService,
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
    forkJoin({
      pattern: this.patternService.getPattern(slug),
      problems: this.patternService.getPatternProblems(slug)
    }).subscribe({
      next: ({ pattern, problems }) => {
        this.pattern = pattern;
        this.problems = problems;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Pattern not found', 'Close', { duration: 4000 });
      }
    });
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

  openProblem(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  categoryLabel(c: string): string {
    const labels: Record<string, string> = {
      ARRAY: 'Array', STRING: 'String', LINKED_LIST: 'Linked List', TREE: 'Tree',
      GRAPH: 'Graph', DP: 'Dynamic Programming', GREEDY: 'Greedy', MATH: 'Math', DESIGN: 'Design'
    };
    return labels[c] ?? c;
  }
}
