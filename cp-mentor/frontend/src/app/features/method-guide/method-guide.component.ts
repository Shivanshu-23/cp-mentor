import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

// Standalone + lazy-loaded (route in app-routing.module.ts uses loadComponent),
// same pattern as /styleguide and /visualize/:slug — this is a large, purely
// static reference page, so its content shouldn't sit in the eager bundle.
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
}
