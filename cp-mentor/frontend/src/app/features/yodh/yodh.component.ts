import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  MINDSET_REFRAMES,
  PHASES,
  PHASE_BUDGET_NOTE,
  CONSTRAINTS_INTRO,
  COMPLEXITY_BUDGET,
  ALSO_EXTRACT_QUESTIONS,
  CONSTRAINTS_ACTION,
  CONSTRAINTS_COMMENT_TEMPLATE,
  CANDIDATE_TECHNIQUES_INTRO,
  FORWARD_DIRECTION_INTRO,
  FORWARD_DIRECTION_STEPS,
  FORWARD_WORKED_EXAMPLE,
  BACKWARD_DIRECTION_INTRO,
  BACKWARD_COMPARISON,
  BACKWARD_CLOSING,
  CANDIDATE_TECHNIQUES_LINE,
  CANDIDATE_TECHNIQUES_CLOSING,
  RESTATE_GUIDANCE,
  HAND_SOLVE_GUIDANCE,
  HAND_SOLVE_EXAMPLES,
  LENS_1_INTRO,
  LENS_1_INPUT_SHAPE,
  LENS_2_INTRO,
  LENS_2_QUESTION_VERBS,
  LENS_3_INTRO,
  LENS_3_ANTI_TRIGGERS,
  BOTTLENECK_QUESTION,
  BOTTLENECK_GUIDANCE,
  MOVES,
  BEYOND_THE_FIVE_INTRO,
  BEYOND_THE_FIVE,
  CODE_GUIDANCE,
  JAVA_HABITS,
  DRY_RUN_CHECKLIST,
  DRY_RUN_CLOSING,
  TRIGGER_DICTIONARY_NOTE,
  TRIGGER_DICTIONARY,
  TIME_CAPS,
  TIME_CAP_INSTRUCTION,
  TIME_CAP_RATIONALE,
  STUCK_LADDER_INTRO,
  STUCK_LADDER,
  RECOVERY_INTRO,
  RECOVERY_STEPS
} from '@content';
import { ConstraintAnalyzerComponent } from '../constraint-analyzer/constraint-analyzer.component';
import { RecallDrillComponent } from '../recall-drill/recall-drill.component';
import { WorksheetService, WorksheetResponse } from '../../core/services/worksheet.service';
import { AuthService } from '../../core/services/auth.service';

// /yodh — "Approach a DSA Problem", built at the user's request as a single
// page combining the full method text with the two existing tools embedded
// live (not linked out to), plus a fillable worksheet that commits to GitHub.
// Public route, no AuthGuard — the Recall Drill embed handles its own
// signed-out state rather than gating the whole page.
//
// Reuses the SAME content constants as /method-guide (full prose, not the
// compact rewrite) — see CLAUDE.md's Copy Deck note for why those are two
// separate efforts. New content specific to this page (candidate-technique
// usage, the algorithm identifier lenses) lives in
// content/method/candidate-techniques.ts and algorithm-identifier.ts.
@Component({
  selector: 'app-yodh',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    ConstraintAnalyzerComponent,
    RecallDrillComponent
  ],
  templateUrl: './yodh.component.html',
  styleUrl: './yodh.component.scss'
})
export class YodhComponent implements OnInit, OnDestroy {
  sections = [
    { id: 'mindset', label: 'Mindset' },
    { id: 'phases', label: 'Five Phases' },
    { id: 'constraints', label: 'Constraints' },
    { id: 'restate', label: 'Restate' },
    { id: 'hand-solve', label: 'Hand-Solve' },
    { id: 'bottleneck', label: 'Bottleneck' },
    { id: 'code', label: 'Code' },
    { id: 'dry-run', label: 'Dry Run' },
    { id: 'time-caps', label: 'Time Caps' },
    { id: 'stuck-ladder', label: 'Stuck Ladder' },
    { id: 'recovery', label: 'Recovery' },
    { id: 'worksheet', label: 'Worksheet' }
  ];

  mindsetReframes = MINDSET_REFRAMES;
  phases = PHASES;
  phaseBudgetNote = PHASE_BUDGET_NOTE;

  constraintsIntro = CONSTRAINTS_INTRO;
  complexityBudget = COMPLEXITY_BUDGET;
  alsoExtractQuestions = ALSO_EXTRACT_QUESTIONS;
  constraintsAction = CONSTRAINTS_ACTION;
  constraintsCommentTemplate = CONSTRAINTS_COMMENT_TEMPLATE;

  candidateTechniquesIntro = CANDIDATE_TECHNIQUES_INTRO;
  forwardIntro = FORWARD_DIRECTION_INTRO;
  forwardSteps = FORWARD_DIRECTION_STEPS;
  forwardExample = FORWARD_WORKED_EXAMPLE;
  backwardIntro = BACKWARD_DIRECTION_INTRO;
  backwardComparison = BACKWARD_COMPARISON;
  backwardClosing = BACKWARD_CLOSING;
  candidateTechniquesLine = CANDIDATE_TECHNIQUES_LINE;
  candidateTechniquesClosing = CANDIDATE_TECHNIQUES_CLOSING;

  restateGuidance = RESTATE_GUIDANCE;

  handSolveGuidance = HAND_SOLVE_GUIDANCE;
  handSolveExamples = HAND_SOLVE_EXAMPLES;

  lens1Intro = LENS_1_INTRO;
  lens1 = LENS_1_INPUT_SHAPE;
  lens2Intro = LENS_2_INTRO;
  lens2 = LENS_2_QUESTION_VERBS;
  lens3Intro = LENS_3_INTRO;
  lens3 = LENS_3_ANTI_TRIGGERS;
  identifierFilter = '';

  bottleneckQuestion = BOTTLENECK_QUESTION;
  bottleneckGuidance = BOTTLENECK_GUIDANCE;
  moves = MOVES;
  beyondTheFiveIntro = BEYOND_THE_FIVE_INTRO;
  beyondTheFive = BEYOND_THE_FIVE;

  codeGuidance = CODE_GUIDANCE;
  javaHabits = JAVA_HABITS;

  dryRunChecklist = DRY_RUN_CHECKLIST;
  dryRunClosing = DRY_RUN_CLOSING;
  triggerDictionaryNote = TRIGGER_DICTIONARY_NOTE;
  triggerDictionary = TRIGGER_DICTIONARY;

  timeCaps = TIME_CAPS;
  timeCapInstruction = TIME_CAP_INSTRUCTION;
  timeCapRationale = TIME_CAP_RATIONALE;

  stuckLadderIntro = STUCK_LADDER_INTRO;
  stuckLadder = STUCK_LADDER;

  recoveryIntro = RECOVERY_INTRO;
  recoverySteps = RECOVERY_STEPS;

  // ── Worksheet form state ──────────────────────────────────────────────
  private readonly STORAGE_KEY = 'yodh_worksheet_draft_v1';
  private readonly isBrowser: boolean;
  private autosaveHandle: ReturnType<typeof setTimeout> | null = null;
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  wk: Record<string, string> = {};
  wkChecks: Record<string, boolean> = {};

  timerRunning = false;
  timerSeconds = 0;

  saveStatus: 'idle' | 'saving' | 'synced' | 'failed' = 'idle';
  lastCommitUrl: string | null = null;
  lastSaveError = '';

  myWorksheets: WorksheetResponse[] = [];
  myWorksheetsLoading = true;
  myWorksheetsSignedOut = false;
  expandedWorksheetId: number | null = null;

  toggleWorksheetExpand(id: number): void {
    this.expandedWorksheetId = this.expandedWorksheetId === id ? null : id;
  }

  get bottleneckWordCount(): number {
    const text = this.wk['bottleneckStatement'] || '';
    return text.trim().length ? text.trim().split(/\s+/).length : 0;
  }

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private worksheetService: WorksheetService,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadDraft();
    this.loadMyWorksheets();
  }

  loadMyWorksheets(): void {
    if (!this.auth.isLoggedIn()) {
      this.myWorksheetsSignedOut = true;
      this.myWorksheetsLoading = false;
      return;
    }
    this.myWorksheetsLoading = true;
    this.worksheetService.listMine().subscribe({
      next: list => {
        this.myWorksheets = list;
        this.myWorksheetsLoading = false;
      },
      error: err => {
        this.myWorksheetsLoading = false;
        if (err?.status === 401) {
          this.myWorksheetsSignedOut = true;
        } else {
          this.snack.open('Failed to load your worksheets', '', { duration: 3000 });
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.autosaveHandle) clearTimeout(this.autosaveHandle);
    if (this.timerHandle) clearInterval(this.timerHandle);
  }

  identifierMatches(row: { clue?: string; looksLike?: string; isActually?: string; reachFor?: string }): boolean {
    if (!this.identifierFilter.trim()) return true;
    const q = this.identifierFilter.trim().toLowerCase();
    return Object.values(row).some(v => (v ?? '').toLowerCase().includes(q));
  }

  onFieldChange(): void {
    this.queueAutosave();
  }

  toggleCheck(key: string): void {
    this.wkChecks[key] = !this.wkChecks[key];
    this.queueAutosave();
  }

  toggleTimer(): void {
    this.timerRunning = !this.timerRunning;
    if (this.timerRunning) {
      if (!this.wk['startedAt']) {
        this.wk['startedAt'] = new Date().toLocaleTimeString();
      }
      this.timerHandle = setInterval(() => { this.timerSeconds++; }, 1000);
    } else if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
    this.queueAutosave();
  }

  formattedTimer(): string {
    const m = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
    const s = (this.timerSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  clearForm(): void {
    if (!confirm('Clear the whole worksheet? This cannot be undone.')) return;
    this.wk = {};
    this.wkChecks = {};
    this.timerSeconds = 0;
    this.timerRunning = false;
    if (this.timerHandle) { clearInterval(this.timerHandle); this.timerHandle = null; }
    this.saveStatus = 'idle';
    this.lastCommitUrl = null;
    if (this.isBrowser) localStorage.removeItem(this.STORAGE_KEY);
  }

  private queueAutosave(): void {
    if (!this.isBrowser) return;
    if (this.autosaveHandle) clearTimeout(this.autosaveHandle);
    this.autosaveHandle = setTimeout(() => this.persistDraft(), 800);
  }

  private persistDraft(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      wk: this.wk,
      wkChecks: this.wkChecks,
      timerSeconds: this.timerSeconds
    }));
  }

  private loadDraft(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      this.wk = parsed.wk ?? {};
      this.wkChecks = parsed.wkChecks ?? {};
      this.timerSeconds = parsed.timerSeconds ?? 0;
    } catch {
      // corrupt draft — ignore, start fresh rather than throw on page load
    }
  }

  private renderMarkdown(): string {
    const title = this.wk['problem'] || 'Untitled Problem';
    const lc = this.wk['lcNumber'] || '';
    const difficulty = this.wk['difficulty'] || '';
    const lines: string[] = [];

    lines.push(`# ${title}${lc ? ` (LC ${lc})` : ''}`);
    lines.push('');
    lines.push(`**Difficulty:** ${difficulty || '_unset_'}  `);
    lines.push(`**Date:** ${this.wk['date'] || '_unset_'}  `);
    lines.push(`**Timer started at:** ${this.wk['startedAt'] || '_unset_'}  `);
    lines.push(`**Time taken:** ${this.formattedTimer()}`);
    lines.push('');

    lines.push('## Phase 0: Constraints');
    lines.push(`- n up to: ${this.wk['nUpTo'] || '_unset_'}`);
    lines.push(`- Values range: ${this.wk['valuesRange'] || '_unset_'}`);
    lines.push(`- Sorted: ${this.wk['sorted'] || '_unset_'} · Negatives: ${this.wk['negatives'] || '_unset_'} · Zeros: ${this.wk['zeros'] || '_unset_'} · Duplicates: ${this.wk['duplicates'] || '_unset_'}`);
    lines.push(`- **Target complexity:** ${this.wk['targetComplexity'] || '_unset_'}`);
    lines.push('');

    lines.push('## Phase 1: Restate + Brute Force');
    lines.push(`**One-sentence restatement:** ${this.wk['restatement'] || '_unset_'}`);
    lines.push('');
    lines.push(`**Brute force idea:** ${this.wk['bruteForceIdea'] || '_unset_'}`);
    lines.push(`- Time: ${this.wk['bruteForceTime'] || '_unset_'} · Space: ${this.wk['bruteForceSpace'] || '_unset_'}`);
    lines.push('');

    lines.push('## Phase 2: Hand-Solve');
    lines.push(`- Small input used: ${this.wk['smallInput'] || '_unset_'}`);
    lines.push(`- Answer by hand: ${this.wk['answerByHand'] || '_unset_'}`);
    lines.push(`**What did my brain actually do?** ${this.wk['brainDid'] || '_unset_'}`);
    lines.push('');

    lines.push('## Phase 3: Bottleneck');
    lines.push(`**What exactly am I recomputing?** ${this.wk['bottleneckStatement'] || '_unset_'}`);
    lines.push('');
    lines.push('Five moves — fired:');
    lines.push(`- [${this.wkChecks['move1'] ? 'x' : ' '}] 1. Store instead of recompute (hash / prefix / memo)`);
    lines.push(`- [${this.wkChecks['move2'] ? 'x' : ' '}] 2. Pointer or window never moves backwards`);
    lines.push(`- [${this.wkChecks['move3'] ? 'x' : ' '}] 3. Sort first, then sweep`);
    lines.push(`- [${this.wkChecks['move4'] ? 'x' : ' '}] 4. Only max/min matters (heap / monotonic stack)`);
    lines.push(`- [${this.wkChecks['move5'] ? 'x' : ' '}] 5. Answer is monotonic (binary search the answer)`);
    lines.push(`- [${this.wkChecks['moveNone'] ? 'x' : ' '}] None fired -> DP? graph? greedy? bitmask?`);
    lines.push('');
    lines.push(`**Chosen approach:** ${this.wk['chosenApproach'] || '_unset_'}`);
    lines.push(`- Final complexity: Time ${this.wk['finalTime'] || '_unset_'} · Space ${this.wk['finalSpace'] || '_unset_'}`);
    lines.push('');

    lines.push('## Phase 5: Dry Run');
    const dryRunKeys: [string, string][] = [
      ['dr1', 'n = 1 / minimum input'], ['dr2', 'all elements identical'],
      ['dr3', 'all negatives'], ['dr4', 'sorted ascending and descending'],
      ['dr5', 'duplicates present'], ['dr6', 'overflow check (use long?)'],
      ['dr7', 'answer at first/last index'], ['dr8', 'no valid answer exists']
    ];
    for (const [key, label] of dryRunKeys) {
      lines.push(`- [${this.wkChecks[key] ? 'x' : ' '}] ${label}`);
    }
    lines.push('');

    lines.push('## Outcome');
    lines.push(`- Solved unaided: ${this.wk['solvedUnaided'] || '_unset_'}`);
    lines.push(`- **Highest rung reached:** ${this.wk['highestRung'] || '_unset_'}`);
    lines.push('');

    lines.push('## Trigger Log');
    lines.push(`- **Trigger:** ${this.wk['trigger'] || '_unset_'}`);
    lines.push(`- **Missed:** ${this.wk['missed'] || '_unset_'}`);
    lines.push(`- **Family:** ${this.wk['family'] || '_unset_'}`);
    lines.push(`- **Reuse in:** ${this.wk['reuseIn'] || '_unset_'}`);
    lines.push(`- Redo: D+2 [${this.wkChecks['redoD2'] ? 'x' : ' '}]  D+7 [${this.wkChecks['redoD7'] ? 'x' : ' '}]`);
    lines.push('');

    lines.push('## If Solution Was Read');
    lines.push(`- [${this.wkChecks['closedTabs'] ? 'x' : ' '}] Closed all tabs`);
    lines.push(`- [${this.wkChecks['waited10'] ? 'x' : ' '}] Waited 10 minutes`);
    lines.push(`- [${this.wkChecks['reimplemented'] ? 'x' : ' '}] Re-implemented from blank editor with no reference`);
    lines.push('');

    return lines.join('\n');
  }

  private slugify(text: string): string {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled';
  }

  save(): void {
    if (!this.wk['problem']?.trim()) {
      this.snack.open('Fill in the problem name before saving', '', { duration: 2500 });
      return;
    }

    this.persistDraft();
    const markdown = this.renderMarkdown();
    const lc = (this.wk['lcNumber'] || '').replace(/[^0-9]/g, '');
    const fileName = `${lc ? lc.padStart(4, '0') + '-' : ''}${this.slugify(this.wk['problem'])}`;

    this.saveStatus = 'saving';
    this.worksheetService.save(fileName, markdown, this.wk['problem'], this.wk['lcNumber'] || '', this.wk['difficulty'] || '').subscribe({
      next: res => {
        this.saveStatus = 'synced';
        this.lastCommitUrl = res.commitUrl;
        this.loadMyWorksheets();
      },
      error: err => {
        this.saveStatus = 'failed';
        // A SQL row is written even when the GitHub commit fails (see
        // WorksheetService.save on the backend) — the worksheet itself
        // isn't lost, only the GitHub sync failed, so refresh the list too.
        this.lastSaveError = err?.error?.message || 'GitHub sync failed — your draft is still saved.';
        this.loadMyWorksheets();
      }
    });
  }

  downloadMarkdown(): void {
    if (!this.isBrowser) return;
    const markdown = this.renderMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.slugify(this.wk['problem'] || 'worksheet')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  copyMarkdown(): void {
    if (!this.isBrowser) return;
    navigator.clipboard.writeText(this.renderMarkdown()).then(
      () => this.snack.open('Markdown copied', '', { duration: 2000 }),
      () => this.snack.open('Copy failed', '', { duration: 2000 })
    );
  }
}
