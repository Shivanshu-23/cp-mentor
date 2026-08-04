import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SolveSessionService, SolveSessionResponse, Move } from '../../core/services/solve-session.service';
import { PatternService, PatternCandidate, HintResult } from '../../core/services/pattern.service';

const DIFFICULTY_CAP_SECONDS: Record<string, number> = {
  Easy: 15 * 60,
  Medium: 35 * 60,
  Hard: 55 * 60
};

@Component({
  selector: 'app-solve-session-worksheet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './solve-session-worksheet.component.html',
  styleUrls: ['./solve-session-worksheet.component.scss']
})
export class SolveSessionWorksheetComponent implements OnInit, OnDestroy {

  session: SolveSessionResponse | null = null;
  loading = true;
  saving = false;
  step = 0; // 0-4, matches the five worksheet phases

  // Step 0 gate — the pasted statement is only ever shown from step 1 onward.
  pastedStatement = '';
  constraintsLocked = false;

  // Step 0 fields
  constraintNotes = '';
  targetComplexity = '';

  // Step 1 fields
  restatement = '';
  bruteForceIdea = '';
  bruteForceComplexity = '';

  // Step 2 fields
  handSolveNotes = '';
  bottleneckStatement = '';
  identifying = false;
  candidates: PatternCandidate[] = [];
  resolvedPatternSlug: string | null = null;
  hints: HintResult[] = [];
  requestingHint = false;
  pendingLevel4Confirm = false;

  // Step 3 fields
  allMoves: Move[] = ['STORE_INSTEAD_OF_RECOMPUTE', 'MONOTONIC_POINTER', 'SORT_FIRST',
    'ONLY_EXTREME_MATTERS', 'BINARY_SEARCH_ANSWER', 'NONE_FIRED'];
  movesFired: Move[] = [];
  finalApproach = '';
  finalComplexity = '';

  // Step 4 fields
  edgeCasesChecked: string[] = [];
  newEdgeCase = '';
  codeSnapshot = '';
  submissionCount = 0;
  solvedUnaided = true;
  stuckRung = 1;

  // Timer
  elapsedSeconds = 0;
  private timerHandle: any;

  // Phase 6: interview follow-ups, surfaced on the completion screen for the resolved pattern
  followUps: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solveSessionService: SolveSessionService,
    private patternService: PatternService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.solveSessionService.getById(id).subscribe({
      next: session => {
        this.session = session;
        this.hydrateFromSession(session);
        this.loading = false;
        this.startTimer();
        if (session.endedAt && session.patternSlug) this.loadFollowUps(session.patternSlug);
      },
      error: () => {
        this.loading = false;
        this.snack.open('Solve session not found', 'Close', { duration: 4000 });
        this.router.navigate(['/solve']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerHandle) clearInterval(this.timerHandle);
  }

  private hydrateFromSession(s: SolveSessionResponse): void {
    this.constraintNotes = s.constraintNotes ?? '';
    this.targetComplexity = s.targetComplexity ?? '';
    this.restatement = s.restatement ?? '';
    this.bruteForceIdea = s.bruteForceIdea ?? '';
    this.bruteForceComplexity = s.bruteForceComplexity ?? '';
    this.handSolveNotes = s.handSolveNotes ?? '';
    this.bottleneckStatement = s.bottleneckStatement ?? '';
    this.movesFired = s.movesFired ?? [];
    this.finalApproach = s.finalApproach ?? '';
    this.finalComplexity = s.finalComplexity ?? '';
    this.edgeCasesChecked = s.edgeCasesChecked ?? [];
    this.codeSnapshot = s.codeSnapshot ?? '';
    this.submissionCount = s.submissionCount;
    this.solvedUnaided = s.solvedUnaided;
    this.stuckRung = s.stuckRung ?? 1;
    this.resolvedPatternSlug = s.patternSlug;
    // Resuming an in-progress session that already has constraint notes means step 0 was
    // already completed in a prior visit — don't re-lock behind a blind paste.
    this.constraintsLocked = !!s.constraintNotes;
  }

  private startTimer(): void {
    if (!this.session) return;
    const started = new Date(this.session.startedAt).getTime();
    this.timerHandle = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - started) / 1000);
    }, 1000);
  }

  get difficultyCapSeconds(): number {
    return DIFFICULTY_CAP_SECONDS[this.session?.difficulty ?? 'Medium'] ?? DIFFICULTY_CAP_SECONDS['Medium'];
  }

  get overCap(): boolean {
    return this.elapsedSeconds > this.difficultyCapSeconds;
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // The header timer is elapsed = now - startedAt with no pause/resume
  // tracking (matches the backend's own duration calc on complete —
  // Duration.between(startedAt, now) — so the two numbers always agree).
  // That's correct for an actively-worked session, but reopening an old,
  // never-completed one shows real wall-clock time since creation, which
  // can run into hours. "331:45" in MM:SS reads like a broken/garbled
  // number; past 60 minutes this switches to "5h 31m" so a stale session
  // reads as stale, not as a bug.
  formatElapsed(seconds: number): string {
    if (seconds < 3600) return this.formatTime(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }

  get sessionLooksAbandoned(): boolean {
    // "Abandoned" here just means the elapsed time is wildly past a normal
    // solve — 3x the cap is well past "ran long," not a tight threshold.
    return this.elapsedSeconds > this.difficultyCapSeconds * 3;
  }

  // ── Step 0: constraints gate ──────────────────────────────────────────────

  lockInConstraints(): void {
    if (!this.constraintNotes.trim()) {
      this.snack.open('Fill in your constraint notes first — that\'s the whole point of this step.', '', { duration: 3000 });
      return;
    }
    this.constraintsLocked = true;
    this.saveStep({ constraintNotes: this.constraintNotes, targetComplexity: this.targetComplexity });
    this.step = 1;
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  goToStep(index: number): void {
    if (index === 0 && !this.constraintsLocked) return; // can't go back to re-hide the statement
    this.step = index;
  }

  nextStep(): void {
    this.autosaveCurrentStep();
    if (this.step < 4) this.step++;
  }

  prevStep(): void {
    if (this.step > 1) this.step--; // never back to 0 once locked
  }

  private autosaveCurrentStep(): void {
    switch (this.step) {
      case 1:
        this.saveStep({ restatement: this.restatement, bruteForceIdea: this.bruteForceIdea, bruteForceComplexity: this.bruteForceComplexity });
        break;
      case 2:
        this.saveStep({ handSolveNotes: this.handSolveNotes, bottleneckStatement: this.bottleneckStatement, patternSlug: this.resolvedPatternSlug ?? undefined });
        break;
      case 3:
        this.saveStep({ movesFired: this.movesFired, finalApproach: this.finalApproach, finalComplexity: this.finalComplexity });
        break;
      case 4:
        this.saveStep({ edgeCasesChecked: this.edgeCasesChecked, codeSnapshot: this.codeSnapshot, submissionCount: this.submissionCount });
        break;
    }
  }

  private saveStep(patch: any): void {
    if (!this.session) return;
    this.saving = true;
    this.solveSessionService.update(this.session.id, patch).subscribe({
      next: () => this.saving = false,
      error: () => {
        this.saving = false;
        this.snack.open('Autosave failed — your work is still on this page, try again', '', { duration: 3000 });
      }
    });
  }

  // ── Step 2: pattern identification + hints ────────────────────────────────

  identifyPattern(): void {
    if (!this.pastedStatement.trim()) {
      this.snack.open('Paste the problem statement in step 0 first', '', { duration: 2500 });
      return;
    }
    this.identifying = true;
    this.patternService.identifyPattern(this.pastedStatement, this.constraintNotes).subscribe({
      next: result => {
        this.candidates = result.candidates;
        this.identifying = false;
      },
      error: () => {
        this.identifying = false;
        this.snack.open('Pattern identification failed', '', { duration: 3000 });
      }
    });
  }

  pickCandidate(slug: string): void {
    this.resolvedPatternSlug = slug;
  }

  requestHint(level: number): void {
    if (!this.session) return;
    if (level === 4 && !this.pendingLevel4Confirm) {
      this.pendingLevel4Confirm = true;
      this.snack.open('Level 4 reveals a full solution — click again to confirm', '', { duration: 4000 });
      return;
    }

    this.requestingHint = true;
    this.patternService.getHint({
      problemStatement: this.pastedStatement || this.session.title,
      problemIdentifier: this.session.leetcodeId,
      level,
      previousHints: this.hints.map(h => h.hint),
      patternSlug: this.resolvedPatternSlug,
      confirmLevel4: level === 4
    }).subscribe({
      next: hint => {
        this.hints.push(hint);
        if (hint.matchedPatternSlug) this.resolvedPatternSlug = hint.matchedPatternSlug;
        this.saveStep({ highestHintLevel: level });
        this.requestingHint = false;
        this.pendingLevel4Confirm = false;
      },
      error: err => {
        this.requestingHint = false;
        this.pendingLevel4Confirm = false;
        const message = err?.error?.message || 'Failed to get hint';
        this.snack.open(message, '', { duration: 4000 });
      }
    });
  }

  // ── Step 3: moves ─────────────────────────────────────────────────────────

  toggleMove(move: Move): void {
    const idx = this.movesFired.indexOf(move);
    if (idx >= 0) this.movesFired.splice(idx, 1);
    else this.movesFired.push(move);
  }

  moveLabel(move: string): string {
    return move.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }

  // ── Step 4: edge cases + completion ───────────────────────────────────────

  addEdgeCase(): void {
    if (this.newEdgeCase.trim()) {
      this.edgeCasesChecked.push(this.newEdgeCase.trim());
      this.newEdgeCase = '';
    }
  }

  removeEdgeCase(index: number): void {
    this.edgeCasesChecked.splice(index, 1);
  }

  completeSession(): void {
    if (!this.session) return;
    this.autosaveCurrentStep();
    this.solveSessionService.complete(this.session.id, {
      solvedUnaided: this.solvedUnaided,
      stuckRung: this.stuckRung
    }).subscribe({
      next: updated => {
        this.session = updated;
        this.snack.open('Session complete!', '', { duration: 2500 });
        if (updated.patternSlug) this.loadFollowUps(updated.patternSlug);
      },
      error: () => this.snack.open('Failed to complete session', '', { duration: 3000 })
    });
  }

  private loadFollowUps(patternSlug: string): void {
    this.patternService.getPattern(patternSlug).subscribe({
      next: pattern => this.followUps = pattern.interviewFollowUps,
      error: () => {} // non-critical — completion screen still works without follow-ups
    });
  }

  get isComplete(): boolean {
    return !!this.session?.endedAt;
  }

  printWorksheet(): void {
    window.print();
  }
}
