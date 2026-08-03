import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import {
  ConstraintAnalyzerService,
  ConstraintAnalysisResponse,
  EdgeCaseResponse,
  EdgeCaseInputType
} from '../../core/services/constraint-analyzer.service';
import { PatternService, PatternSummary } from '../../core/services/pattern.service';

@Component({
  selector: 'app-constraint-analyzer',
  templateUrl: './constraint-analyzer.component.html',
  styleUrls: ['./constraint-analyzer.component.scss']
})
export class ConstraintAnalyzerComponent implements OnInit {

  // Form state
  n: number | null = 100000;
  maxValue: number | null = null;
  sorted = false;
  negativesAllowed = false;
  duplicatesAllowed = false;
  valuesBounded = false;
  inputType: EdgeCaseInputType = 'ARRAY';
  patternSlug = '';

  inputTypes: EdgeCaseInputType[] = ['ARRAY', 'STRING', 'TREE', 'GRAPH', 'MATRIX', 'NUMBER'];
  patterns: PatternSummary[] = [];

  loading = false;
  analyzed = false;
  constraintResult: ConstraintAnalysisResponse | null = null;
  edgeCaseResult: EdgeCaseResponse | null = null;

  constructor(
    private analyzerService: ConstraintAnalyzerService,
    private patternService: PatternService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.patternService.getPatterns(undefined, 0, 100).subscribe({
      next: res => this.patterns = res.content,
      error: () => {} // pattern dropdown is a nice-to-have, don't block the page on it
    });
  }

  analyze(): void {
    if (!this.n || this.n < 1) {
      this.snack.open('Enter a valid max input size (n)', '', { duration: 2500 });
      return;
    }

    this.loading = true;
    forkJoin({
      constraints: this.analyzerService.analyzeConstraints({
        n: this.n,
        sorted: this.sorted,
        negativesAllowed: this.negativesAllowed,
        duplicatesAllowed: this.duplicatesAllowed,
        valuesBounded: this.valuesBounded,
        maxValue: this.maxValue
      }),
      edgeCases: this.analyzerService.generateEdgeCases({
        inputType: this.inputType,
        sorted: this.sorted,
        negativesAllowed: this.negativesAllowed,
        duplicatesAllowed: this.duplicatesAllowed,
        valuesBounded: this.valuesBounded,
        patternSlug: this.patternSlug || null
      })
    }).subscribe({
      next: ({ constraints, edgeCases }) => {
        this.constraintResult = constraints;
        this.edgeCaseResult = edgeCases;
        this.analyzed = true;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to analyze — try again', '', { duration: 3000 });
      }
    });
  }

  printChecklist(): void {
    window.print();
  }

  inputTypeLabel(t: string): string {
    return t.charAt(0) + t.slice(1).toLowerCase();
  }
}
