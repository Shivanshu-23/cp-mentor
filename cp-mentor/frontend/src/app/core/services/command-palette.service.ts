import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { AuthService } from './auth.service';
import { PatternService } from './pattern.service';
import { ProblemService } from './problem.service';
import { fuzzyScore } from '../../shared/command-palette/fuzzy-match';

export interface PaletteItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  kind: 'route' | 'action' | 'pattern' | 'problem' | 'company';
  keywords?: string;
  run: () => void;
}

@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  private readonly RECENT_KEY = 'cp_mentor_palette_recent';
  private readonly RECENT_MAX = 8;

  private openSubject = new BehaviorSubject<boolean>(false);
  open$ = this.openSubject.asObservable();

  private dynamicItems: PaletteItem[] = [];
  private dynamicLoaded = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private patternService: PatternService,
    private problemService: ProblemService,
    private http: HttpClient
  ) {}

  open(): void {
    if (!this.dynamicLoaded) this.loadDynamicItems();
    this.openSubject.next(true);
  }

  close(): void {
    this.openSubject.next(false);
  }

  toggle(): void {
    this.openSubject.value ? this.close() : this.open();
  }

  isOpen(): boolean {
    return this.openSubject.value;
  }

  private navigate(path: string): void {
    this.router.navigateByUrl(path);
  }

  private staticItems(): PaletteItem[] {
    const loggedIn = this.authService.isLoggedIn();

    const items: PaletteItem[] = [
      { id: 'route-patterns', label: 'Pattern Library', sublabel: 'Browse all patterns', icon: 'lightbulb', kind: 'route', run: () => this.navigate('/patterns') },
      { id: 'route-home', label: 'Daily Problem', sublabel: 'Today\'s challenge + LeetCode activity', icon: 'home', kind: 'route', run: () => this.navigate('/home') },
      { id: 'route-company', label: 'Company Tracker', sublabel: 'DSA problems by company', icon: 'business', kind: 'route', run: () => this.navigate('/company-tracker') },
      { id: 'route-constraint', label: 'Constraint Analyzer', sublabel: 'n → target complexity', icon: 'analytics', kind: 'route', run: () => this.navigate('/constraint-analyzer') },
      { id: 'action-solve', label: 'Start Solve Session', sublabel: 'Open the worksheet', icon: 'edit_note', kind: 'action', run: () => this.navigate('/solve') },
      { id: 'action-drill', label: 'Open Recall Drill', sublabel: 'Today\'s due reviews', icon: 'psychology', kind: 'action', run: () => this.navigate('/recall-drill') },
      { id: 'route-progress', label: 'Progress Dashboard', icon: 'bar_chart', kind: 'route', run: () => this.navigate('/progress') },
    ];

    if (loggedIn) {
      items.push({ id: 'action-logout', label: 'Log out', icon: 'logout', kind: 'action', run: () => this.authService.logout() });
    } else {
      items.push({ id: 'route-login', label: 'Log in', icon: 'login', kind: 'route', run: () => this.navigate('/login') });
      items.push({ id: 'route-register', label: 'Sign up', icon: 'person_add', kind: 'route', run: () => this.navigate('/register') });
    }

    if (isDevMode()) {
      items.push({ id: 'route-styleguide', label: 'Styleguide', sublabel: 'Dev-only design tokens', icon: 'palette', kind: 'route', run: () => this.navigate('/styleguide') });
    }

    return items;
  }

  private loadDynamicItems(): void {
    this.dynamicLoaded = true; // set eagerly — don't refetch on every open() while the first load is in flight
    forkJoin({
      patterns: this.patternService.getPatterns(undefined, 0, 100),
      problems: this.problemService.getAllProblems(0, 100),
      companies: this.http.get<string[]>('/api/v1/company-problems/companies')
    }).subscribe({
      next: ({ patterns, problems, companies }) => {
        const patternItems: PaletteItem[] = patterns.content.map(p => ({
          id: `pattern-${p.slug}`,
          label: p.name,
          sublabel: 'Pattern',
          icon: 'lightbulb',
          kind: 'pattern',
          keywords: p.recognitionTriggers.join(' '),
          run: () => this.navigate(`/patterns/${p.slug}`)
        }));

        const problemItems: PaletteItem[] = problems.content.map(p => ({
          id: `problem-${p.id}`,
          label: p.title,
          sublabel: `#${p.leetcodeId} · ${p.difficulty}`,
          icon: 'code',
          kind: 'problem',
          run: () => this.navigate(`/analysis/${p.id}`)
        }));

        const companyItems: PaletteItem[] = companies.map(c => ({
          id: `company-${c}`,
          label: c,
          sublabel: 'Company',
          icon: 'business',
          kind: 'company',
          run: () => this.navigate(`/company-tracker?company=${encodeURIComponent(c)}`)
        }));

        this.dynamicItems = [...patternItems, ...problemItems, ...companyItems];
      },
      error: () => { this.dynamicLoaded = false; } // allow a retry on next open()
    });
  }

  search(query: string): PaletteItem[] {
    const all = [...this.staticItems(), ...this.dynamicItems];
    const trimmed = query.trim();

    if (!trimmed) {
      const recent = this.recentItems(all);
      return recent.length ? recent : all.slice(0, 8);
    }

    return all
      .map(item => ({ item, score: fuzzyScore(trimmed, `${item.label} ${item.keywords ?? ''}`) }))
      .filter(x => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map(x => x.item);
  }

  run(item: PaletteItem): void {
    this.recordRecent(item.id);
    this.close();
    item.run();
  }

  private recordRecent(id: string): void {
    const ids = this.readRecentIds().filter(existing => existing !== id);
    ids.unshift(id);
    localStorage.setItem(this.RECENT_KEY, JSON.stringify(ids.slice(0, this.RECENT_MAX)));
  }

  private readRecentIds(): string[] {
    try {
      const raw = localStorage.getItem(this.RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private recentItems(all: PaletteItem[]): PaletteItem[] {
    const byId = new Map(all.map(item => [item.id, item]));
    return this.readRecentIds()
      .map(id => byId.get(id))
      .filter((item): item is PaletteItem => !!item);
  }
}
