import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  SCRIPT_INTRO,
  INTERVIEW_SCRIPT,
  SCRIPT_CLOSING,
  ONE_CARD_SUMMARY,
  WORKED_EXAMPLES
} from '@content';

// Standalone + lazy-loaded (route in app-routing.module.ts uses loadComponent),
// same pattern as /styleguide and /visualize/:slug.
//
// 2026-08-04: trimmed down to only the content that ISN'T on /yodh — /yodh
// now covers Mindset, Five Phases, Constraints (+ live Constraint Analyzer
// embed), Restate, Hand-Solve (+ Algorithm Identifier), Bottleneck/Five
// Moves, Code, Dry Run (+ Trigger Dictionary + live Recall Drill embed),
// Time Caps, Stuck Ladder, Recovery Protocol, and a fillable
// GitHub-syncing worksheet — all better than this page's static/print-only
// versions of the same sections. This page is now just the three things
// /yodh doesn't have: Worked Examples, the Interview Script, and the
// One-Card printable summary. See CLAUDE.md's Yodh section for the decision.
@Component({
  selector: 'app-method-guide',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './method-guide.component.html',
  styleUrl: './method-guide.component.scss'
})
export class MethodGuideComponent {
  sections = [
    { id: 'worked-examples', label: 'Worked Examples' },
    { id: 'script', label: 'Interview Script' },
    { id: 'card', label: 'One-Card Summary' }
  ];

  workedExamples = WORKED_EXAMPLES;

  scriptIntro = SCRIPT_INTRO;
  interviewScript = INTERVIEW_SCRIPT;
  scriptClosing = SCRIPT_CLOSING;

  oneCardSummary = ONE_CARD_SUMMARY;

  easyBadgeClass(difficulty: string): string {
    return difficulty.toLowerCase();
  }
}
