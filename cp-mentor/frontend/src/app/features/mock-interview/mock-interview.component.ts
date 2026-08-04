import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MockInterviewService } from '../../core/services/mock-interview.service';
import { SolveSessionService } from '../../core/services/solve-session.service';

// Picks a random problem (excluding ones already completed where possible —
// see MockInterviewService on the backend) and drops straight into a
// pre-filled Solve Session, matching Phase 4's own 15/35/55 min time caps —
// no new timer logic, just a different way to arrive at the worksheet than
// typing a leetcodeId/title in by hand on /solve.
const DIFFICULTY_CAP_MINUTES: Record<string, number> = { Easy: 15, Medium: 35, Hard: 55 };

@Component({
  selector: 'app-mock-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatIconModule, MatButtonModule, MatRadioModule, MatProgressSpinnerModule],
  templateUrl: './mock-interview.component.html',
  styleUrl: './mock-interview.component.scss'
})
export class MockInterviewComponent {

  difficulties = ['Easy', 'Medium', 'Hard', 'Any'];
  selectedDifficulty = 'Medium';
  starting = false;

  constructor(
    private mockInterviewService: MockInterviewService,
    private solveSessionService: SolveSessionService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  capMinutes(): number | null {
    return DIFFICULTY_CAP_MINUTES[this.selectedDifficulty] ?? null;
  }

  start(): void {
    this.starting = true;
    const difficulty = this.selectedDifficulty === 'Any' ? undefined : this.selectedDifficulty;

    this.mockInterviewService.randomProblem(difficulty).subscribe({
      next: problem => {
        this.solveSessionService.create({
          leetcodeId: problem.leetcodeId,
          title: problem.title,
          difficulty: problem.difficulty
        }).subscribe({
          next: session => {
            this.starting = false;
            this.router.navigate(['/solve', session.id]);
          },
          error: () => {
            this.starting = false;
            this.snack.open('Failed to start the solve session', '', { duration: 3000 });
          }
        });
      },
      error: err => {
        this.starting = false;
        const msg = err?.status === 404 ? 'No problems available at that difficulty yet.' : 'Failed to pick a problem — try again.';
        this.snack.open(msg, '', { duration: 3000 });
      }
    });
  }
}
