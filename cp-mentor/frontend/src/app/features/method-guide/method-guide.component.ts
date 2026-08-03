import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  MINDSET_REFRAMES,
  PHASES,
  PHASE_BUDGET_NOTE,
  RESTATE_GUIDANCE,
  HAND_SOLVE_GUIDANCE,
  HAND_SOLVE_EXAMPLES,
  BOTTLENECK_QUESTION,
  BOTTLENECK_GUIDANCE,
  BEYOND_THE_FIVE_INTRO,
  BEYOND_THE_FIVE,
  CODE_GUIDANCE,
  JAVA_HABITS,
  DRY_RUN_CHECKLIST,
  DRY_RUN_CLOSING,
  TIME_CAPS,
  TIME_CAP_INSTRUCTION,
  TIME_CAP_RATIONALE,
  COMPLEXITY_BUDGET,
  CONSTRAINTS_INTRO,
  ALSO_EXTRACT_QUESTIONS,
  CONSTRAINTS_ACTION,
  CONSTRAINTS_COMMENT_TEMPLATE,
  MOVES,
  STUCK_LADDER_INTRO,
  STUCK_LADDER,
  RECOVERY_INTRO,
  RECOVERY_STEPS,
  TRIGGER_LOG_INTRO,
  TRIGGER_LOG_FORMAT_EXAMPLE,
  WHY_TRIGGER_MATTERS,
  DAILY_REVISION,
  TRIGGER_DICTIONARY_NOTE,
  TRIGGER_DICTIONARY,
  SCRIPT_INTRO,
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
  phases = PHASES;
  phaseBudgetNote = PHASE_BUDGET_NOTE;

  constraintsIntro = CONSTRAINTS_INTRO;
  complexityBudget = COMPLEXITY_BUDGET;
  alsoExtractQuestions = ALSO_EXTRACT_QUESTIONS;
  constraintsAction = CONSTRAINTS_ACTION;
  constraintsCommentTemplate = CONSTRAINTS_COMMENT_TEMPLATE;

  restateGuidance = RESTATE_GUIDANCE;

  handSolveGuidance = HAND_SOLVE_GUIDANCE;
  handSolveExamples = HAND_SOLVE_EXAMPLES;

  bottleneckQuestion = BOTTLENECK_QUESTION;
  bottleneckGuidance = BOTTLENECK_GUIDANCE;
  moves = MOVES;
  beyondTheFiveIntro = BEYOND_THE_FIVE_INTRO;
  beyondTheFive = BEYOND_THE_FIVE;

  codeGuidance = CODE_GUIDANCE;
  javaHabits = JAVA_HABITS;

  dryRunChecklist = DRY_RUN_CHECKLIST;
  dryRunClosing = DRY_RUN_CLOSING;

  timeCaps = TIME_CAPS;
  timeCapInstruction = TIME_CAP_INSTRUCTION;
  timeCapRationale = TIME_CAP_RATIONALE;

  stuckLadderIntro = STUCK_LADDER_INTRO;
  stuckLadder = STUCK_LADDER;

  recoveryIntro = RECOVERY_INTRO;
  recoverySteps = RECOVERY_STEPS;

  triggerLogIntro = TRIGGER_LOG_INTRO;
  triggerLogFormatExample = TRIGGER_LOG_FORMAT_EXAMPLE;
  whyTriggerMatters = WHY_TRIGGER_MATTERS;
  dailyRevision = DAILY_REVISION;

  triggerDictionaryNote = TRIGGER_DICTIONARY_NOTE;
  triggerDictionary = TRIGGER_DICTIONARY;

  workedExamples = WORKED_EXAMPLES;

  scriptIntro = SCRIPT_INTRO;
  interviewScript = INTERVIEW_SCRIPT;
  scriptClosing = SCRIPT_CLOSING;

  worksheetIntro = WORKSHEET_INTRO;
  worksheetSections = WORKSHEET_SECTIONS;

  oneCardSummary = ONE_CARD_SUMMARY;

  easyBadgeClass(difficulty: string): string {
    return difficulty.toLowerCase();
  }
}
