import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

export interface CompanyProblem {
  id: number;
  leetcodeId: string;
  url: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company: string;
  timeframe: string;
  acceptanceRate: string;
  frequency: string;
  tickCount: number; // 0-3
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-company-tracker',
  templateUrl: './company-tracker.component.html',
  styleUrls: ['./company-tracker.component.scss']
})
export class CompanyTrackerComponent implements OnInit {

  problems: CompanyProblem[] = [];
  companies: string[] = [];
  loading = false;
  loadingCompanies = true;

  // Filters
  selectedCompany = 'amazon';
  selectedDifficulty = 'all';
  searchTerm = '';

  // Pagination
  page = 0;
  pageSize = 50;
  totalElements = 0;
  totalPages = 0;

  // Stats
  stats = { solved: 0, attempted: 0, seen: 0, total: 0 };

  difficulties = ['all', 'Easy', 'Medium', 'Hard'];

  tickLabels = ['Not Started', 'Attempted', 'Revisited', 'Revised'];
  tickColors = ['#484f58', '#d29922', '#58a6ff', '#3fb950'];
  tickIcons  = ['radio_button_unchecked', 'visibility', 'code', 'check_circle'];

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadStats();
  }

  loadCompanies(): void {
    this.http.get<string[]>('/api/v1/company-problems/companies').subscribe({
      next: companies => {
        this.companies = companies.length > 0 ? companies : this.defaultCompanies();
        this.loadingCompanies = false;
        this.loadProblems();
      },
      error: () => {
        this.companies = this.defaultCompanies();
        this.loadingCompanies = false;
        this.loadProblems();
      }
    });
  }

  get filteredProblems(): CompanyProblem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.problems;
    return this.problems.filter(p => p.title.toLowerCase().includes(term));
  }

  loadProblems(): void {
    this.loading = true;
    const params = new URLSearchParams({
      company: this.selectedCompany,
      timeframe: 'all',
      difficulty: this.selectedDifficulty,
      page: this.page.toString(),
      size: this.pageSize.toString()
    });

    this.http.get<PageResponse<CompanyProblem>>(`/api/v1/company-problems?${params}`).subscribe({
      next: res => {
        this.problems = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load problems', '', { duration: 3000 });
      }
    });
  }

  onFilterChange(): void {
    this.page = 0;
    this.loadProblems();
  }

  tick(problem: CompanyProblem): void {
    if (!this.auth.isLoggedIn()) {
      this.snack.open('Login to track your progress', 'Login', { duration: 3000 });
      return;
    }

    // Optimistic UI update
    const oldTick = problem.tickCount;
    problem.tickCount = (problem.tickCount + 1) % 4;

    this.http.post<any>(`/api/v1/company-problems/${problem.leetcodeId}/tick`, {}).subscribe({
      next: res => {
        problem.tickCount = res.tickCount;
        if (res.tickCount === 3) {
          this.snack.open(`✅ "${problem.title}" marked as ${this.tickLabels[3].toLowerCase()}!`, '', { duration: 2000 });
          this.stats.solved++;
        }
      },
      error: () => {
        problem.tickCount = oldTick; // revert on error
        this.snack.open('Failed to update progress', '', { duration: 2000 });
      }
    });
  }

  loadStats(): void {
    if (!this.auth.isLoggedIn()) return;
    this.http.get<any>('/api/v1/company-problems/stats').subscribe({
      next: s => this.stats = s,
      error: () => {}
    });
  }

  openProblem(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  prevPage(): void {
    if (this.page > 0) { this.page--; this.loadProblems(); }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) { this.page++; this.loadProblems(); }
  }

  diffColor(d: string): string {
    return { Easy: '#3fb950', Medium: '#d29922', Hard: '#f85149' }[d] ?? '#8b949e';
  }

  diffBg(d: string): string {
    return { Easy: '#1f4d2e', Medium: '#4d3800', Hard: '#4d1f1f' }[d] ?? '#1c2128';
  }

  companyLabel(c: string): string {
    return c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  private defaultCompanies(): string[] {
    return ['amazon','google','microsoft','meta','apple','uber','netflix',
            'bloomberg','adobe','atlassian','linkedin','oracle','salesforce',
            'walmart','paypal','goldman-sachs','morgan-stanley','jpmorgan'];
  }
}
