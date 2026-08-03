import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatternService, PatternSummary, PatternCategory } from '../../core/services/pattern.service';

@Component({
  selector: 'app-pattern-library',
  templateUrl: './pattern-library.component.html',
  styleUrls: ['./pattern-library.component.scss']
})
export class PatternLibraryComponent implements OnInit {

  patterns: PatternSummary[] = [];
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

  constructor(private patternService: PatternService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.loadPatterns();
  }

  loadPatterns(): void {
    this.loading = true;
    this.patternService.getPatterns(undefined, 0, 100).subscribe({
      next: res => {
        this.patterns = res.content;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load pattern library', '', { duration: 3000 });
      }
    });
  }

  get filteredPatterns(): PatternSummary[] {
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

  categoryLabel(c: string): string {
    return this.categoryLabels[c] ?? c;
  }

  difficultyStars(n: number): string {
    return '●'.repeat(n) + '○'.repeat(5 - n);
  }
}
