import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommandPaletteService } from './command-palette.service';

export interface ShortcutEntry {
  keys: string;
  description: string;
}

// Global keyboard shortcuts from the engineering appendix. Scope note: this
// service owns the shortcuts that are meaningful app-wide (palette, chord
// navigation, help). Per-worksheet shortcuts (t / h / Enter-to-advance-phase,
// j/k list navigation) are deliberately NOT wired here yet — those live
// inside specific components (e.g. the solve-session worksheet) and are
// scoped to a later phase; see CLAUDE.md.
@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService implements OnDestroy {
  readonly shortcuts: ShortcutEntry[] = [
    { keys: 'Cmd/Ctrl K', description: 'Open command palette' },
    { keys: '/', description: 'Focus this page\'s search field' },
    { keys: 'g then p', description: 'Go to Pattern Library' },
    { keys: 'g then d', description: 'Go to Recall Drill' },
    { keys: '?', description: 'Show this help' },
    { keys: 'Esc', description: 'Close any open dialog' },
  ];

  private helpOpenSubject = new BehaviorSubject<boolean>(false);
  helpOpen$ = this.helpOpenSubject.asObservable();

  private awaitingChord = false;
  private chordTimeout?: ReturnType<typeof setTimeout>;
  private readonly CHORD_WINDOW_MS = 600;

  private boundHandler = (event: KeyboardEvent) => this.handleKeydown(event);

  constructor(
    private zone: NgZone,
    private router: Router,
    private paletteService: CommandPaletteService
  ) {}

  init(): void {
    this.zone.runOutsideAngular(() => {
      document.addEventListener('keydown', this.boundHandler);
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.boundHandler);
  }

  closeHelp(): void {
    this.helpOpenSubject.next(false);
  }

  private handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isTyping = !!target && (
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' || target.isContentEditable
    );

    // Cmd/Ctrl+K works even while typing — standard palette convention.
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.zone.run(() => this.paletteService.toggle());
      return;
    }

    if (isTyping) return;

    if (event.key === 'Escape') {
      if (this.helpOpenSubject.value) this.zone.run(() => this.closeHelp());
      return;
    }

    if (event.key === '?') {
      event.preventDefault();
      this.zone.run(() => this.helpOpenSubject.next(!this.helpOpenSubject.value));
      return;
    }

    if (event.key === '/') {
      event.preventDefault();
      const searchEl = document.querySelector<HTMLElement>('[data-shortcut-search]');
      searchEl?.focus();
      return;
    }

    if (event.key === 'g') {
      this.awaitingChord = true;
      clearTimeout(this.chordTimeout);
      this.chordTimeout = setTimeout(() => { this.awaitingChord = false; }, this.CHORD_WINDOW_MS);
      return;
    }

    if (this.awaitingChord) {
      this.awaitingChord = false;
      clearTimeout(this.chordTimeout);
      if (event.key === 'p') { this.zone.run(() => this.router.navigateByUrl('/patterns')); }
      else if (event.key === 'd') { this.zone.run(() => this.router.navigateByUrl('/recall-drill')); }
    }
  }
}
