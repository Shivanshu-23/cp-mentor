import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PatternCategory } from '../../core/services/pattern.service';
import { Pattern, PATTERNS } from '@content';

// Sourced from the frontend-static content layer (src/app/content/patterns),
// not an HTTP call — the Pattern Library is reference data, so it should
// render instantly, work offline, and prerender to real HTML without a
// backend round-trip. See CLAUDE.md "Frontend-Static Content Layer".
@Component({
  selector: 'app-pattern-library',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
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

  ngOnInit(): void {
    this.loadPatterns();
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
