import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { KeyboardShortcutsService, ShortcutEntry } from '../../core/services/keyboard-shortcuts.service';

@Component({
  selector: 'app-help-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './help-overlay.component.html',
  styleUrls: ['./help-overlay.component.scss']
})
export class HelpOverlayComponent implements OnInit, OnDestroy {
  isOpen = false;
  shortcuts: ShortcutEntry[] = [];
  private sub?: Subscription;

  constructor(private keyboardShortcuts: KeyboardShortcutsService) {
    this.shortcuts = keyboardShortcuts.shortcuts;
  }

  ngOnInit(): void {
    this.sub = this.keyboardShortcuts.helpOpen$.subscribe(open => this.isOpen = open);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close(): void {
    this.keyboardShortcuts.closeHelp();
  }
}
