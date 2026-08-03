import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Swatch { name: string; token: string; }

// Dev-only reference page for the v2 design system (Phase A). Not part of
// the app's information architecture — never linked from the nav. See
// app-routing.module.ts for the isDevMode() gate that keeps this route
// unreachable in production, and CLAUDE.md for how far that gate actually
// goes (route unreachable, chunk still built — real file-level exclusion
// would need Angular's environment/fileReplacements system, not adopted
// here to avoid deviating from the rest of the app's structure).
@Component({
  selector: 'app-styleguide',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatCheckboxModule, MatProgressSpinnerModule
  ],
  templateUrl: './styleguide.component.html',
  styleUrl: './styleguide.component.scss'
})
export class StyleguideComponent {
  surfaces: Swatch[] = [
    { name: 'surface-0 · page', token: '--surface-0' },
    { name: 'surface-1 · card/row', token: '--surface-1' },
    { name: 'surface-2 · menu/tooltip', token: '--surface-2' },
    { name: 'surface-3 · dialog/palette', token: '--surface-3' },
  ];

  accents: Swatch[] = [
    { name: 'accent', token: '--accent' },
    { name: 'state-success', token: '--state-success' },
    { name: 'state-warning', token: '--state-warning' },
    { name: 'state-error', token: '--state-error' },
  ];

  textColors: Swatch[] = [
    { name: 'text-primary (~16:1)', token: '--text-primary' },
    { name: 'text-secondary (~9:1)', token: '--text-secondary' },
    { name: 'text-muted (~5.6:1, UI chrome only)', token: '--text-muted' },
  ];

  spacing = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
  radii = ['sm', 'md', 'lg'];
  typeScale = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
  durations = ['fast', 'base', 'slow'];
}
