import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  MINDSET_REFRAMES,
  MINDSET_COMPACT,
  PHASES,
  PHASE_BUDGET_NOTE,
  RESTATE_GUIDANCE,
  RESTATE_COMPACT,
  HAND_SOLVE_GUIDANCE,
  HAND_SOLVE_COMPACT,
  HAND_SOLVE_EXAMPLES,
  BOTTLENECK_QUESTION,
  BOTTLENECK_GUIDANCE,
  BOTTLENECK_COMPACT,
  BEYOND_THE_FIVE_INTRO,
  BEYOND_THE_FIVE,
  CODE_GUIDANCE,
  CODE_COMPACT,
  JAVA_HABITS,
  JAVA_HABITS_TABLE,
  SORT_NOTE_COMPACT,
  DRY_RUN_CHECKLIST,
  DRY_RUN_CLOSING,
  DRY_RUN_COMPACT,
  TIME_CAPS,
  TIME_CAP_INSTRUCTION,
  TIME_CAP_RATIONALE,
  TIME_CAP_COMPACT,
  COMPLEXITY_BUDGET,
  CONSTRAINTS_INTRO,
  CONSTRAINTS_COMPACT,
  ALSO_EXTRACT_QUESTIONS,
  CONSTRAINTS_ACTION,
  CONSTRAINTS_COMMENT_TEMPLATE,
  MOVES,
  STUCK_LADDER_INTRO,
  STUCK_LADDER,
  RECOVERY_INTRO,
  RECOVERY_STEPS,
  TRIGGER_LOG_INTRO,
  TRIGGER_LOG_COMPACT,
  TRIGGER_LOG_FORMAT_EXAMPLE,
  WHY_TRIGGER_MATTERS,
  COMPARISON_CAPTION_COMPACT,
  DAILY_REVISION,
  DAILY_REVISION_COMPACT,
  TRIGGER_DICTIONARY_NOTE,
  TRIGGER_DICTIONARY,
  SCRIPT_INTRO,
  SCRIPT_INTRO_COMPACT,
  INTERVIEW_SCRIPT,
  SCRIPT_CLOSING,
  WORKSHEET_INTRO,
  WORKSHEET_SECTIONS,
  ONE_CARD_SUMMARY,
  WORKED_EXAMPLES
} from '@content';

// Standalone + lazy-loaded (route in app-routing.module.ts uses loadComponent),
// same pattern as /styleguide and /visualize/:slug — this is a large, purely
// static reference page, so its content shouldn't sit in the eager bundle.
//
// Renders entirely from the typed content/ layer (src/app/content) rather than
// hardcoded template prose — the point of the frontend-static content decision
// is a single typed source of truth the compiler checks, not a page that
// happens to also be static. See CLAUDE.md.
@Component({
  selector: 'app-method-guide',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './method-guide.component.html',
  styleUrl: './method-guide.component.scss'
})
export class MethodGuideComponent {
  sections = [
    { id: 'mindset', label: 'The Mindset Shift' },
    { id: 'phases', label: 'The Five Phases' },
    { id: 'constraints', label: 'Constraints First' },
    { id: 'restate', label: 'Restate + Brute Force' },
    { id: 'hand-solve', label: 'Hand-Solve' },
    { id: 'bottleneck', label: 'Bottleneck + Five Moves' },
    { id: 'code', label: 'Code' },
    { id: 'dry-run', label: 'Dry Run' },
    { id: 'time-caps', label: 'Time Caps' },
    { id: 'stuck-ladder', label: 'Stuck Ladder' },
    { id: 'recovery', label: 'Recovery Protocol' },
    { id: 'trigger-log', label: 'Trigger Log' },
    { id: 'dictionary', label: 'Trigger Dictionary' },
    { id: 'worked-examples', label: 'Worked Examples' },
    { id: 'script', label: 'Interview Script' },
    { id: 'worksheet', label: 'Worksheet' },
    { id: 'card', label: 'One-Card Summary' }
  ];

  mindsetReframes = MINDSET_REFRAMES;
  mindsetCompact = MINDSET_COMPACT;
  phases = PHASES;
  phaseBudgetNote = PHASE_BUDGET_NOTE;

  constraintsIntro = CONSTRAINTS_INTRO;
  constraintsCompact = CONSTRAINTS_COMPACT;
  complexityBudget = COMPLEXITY_BUDGET;
  alsoExtractQuestions = ALSO_EXTRACT_QUESTIONS;
  constraintsAction = CONSTRAINTS_ACTION;
  constraintsCommentTemplate = CONSTRAINTS_COMMENT_TEMPLATE;

  restateGuidance = RESTATE_GUIDANCE;
  restateCompact = RESTATE_COMPACT;

  handSolveGuidance = HAND_SOLVE_GUIDANCE;
  handSolveCompact = HAND_SOLVE_COMPACT;
  handSolveExamples = HAND_SOLVE_EXAMPLES;

  bottleneckQuestion = BOTTLENECK_QUESTION;
  bottleneckGuidance = BOTTLENECK_GUIDANCE;
  bottleneckCompact = BOTTLENECK_COMPACT;
  moves = MOVES;
  beyondTheFiveIntro = BEYOND_THE_FIVE_INTRO;
  beyondTheFive = BEYOND_THE_FIVE;

  codeGuidance = CODE_GUIDANCE;
  codeCompact = CODE_COMPACT;
  javaHabits = JAVA_HABITS;
  javaHabitsTable = JAVA_HABITS_TABLE;
  sortNoteCompact = SORT_NOTE_COMPACT;

  dryRunChecklist = DRY_RUN_CHECKLIST;
  dryRunClosing = DRY_RUN_CLOSING;
  dryRunCompact = DRY_RUN_COMPACT;

  timeCaps = TIME_CAPS;
  timeCapInstruction = TIME_CAP_INSTRUCTION;
  timeCapRationale = TIME_CAP_RATIONALE;
  timeCapCompact = TIME_CAP_COMPACT;

  stuckLadderIntro = STUCK_LADDER_INTRO;
  stuckLadder = STUCK_LADDER;

  recoveryIntro = RECOVERY_INTRO;
  recoverySteps = RECOVERY_STEPS;

  triggerLogIntro = TRIGGER_LOG_INTRO;
  triggerLogCompact = TRIGGER_LOG_COMPACT;
  triggerLogFormatExample = TRIGGER_LOG_FORMAT_EXAMPLE;
  whyTriggerMatters = WHY_TRIGGER_MATTERS;
  comparisonCaptionCompact = COMPARISON_CAPTION_COMPACT;
  dailyRevision = DAILY_REVISION;
  dailyRevisionCompact = DAILY_REVISION_COMPACT;

  triggerDictionaryNote = TRIGGER_DICTIONARY_NOTE;
  triggerDictionary = TRIGGER_DICTIONARY;

  workedExamples = WORKED_EXAMPLES;

  scriptIntro = SCRIPT_INTRO;
  scriptIntroCompact = SCRIPT_INTRO_COMPACT;
  interviewScript = INTERVIEW_SCRIPT;
  scriptClosing = SCRIPT_CLOSING;

  worksheetIntro = WORKSHEET_INTRO;
  worksheetSections = WORKSHEET_SECTIONS;

  oneCardSummary = ONE_CARD_SUMMARY;

  // Object.keys(mindsetCompact) doesn't preserve reliable ordering for template
  // *ngFor across a Record — index mindsetReframes by id instead.
  mindsetCompactFor(id: string): string {
    return (this.mindsetCompact as Record<string, string>)[id];
  }

  easyBadgeClass(difficulty: string): string {
    return difficulty.toLowerCase();
  }
}
