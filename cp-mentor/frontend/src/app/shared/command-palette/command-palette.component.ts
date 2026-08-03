import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommandPaletteService, PaletteItem } from '../../core/services/command-palette.service';

@Component({
  selector: 'app-command-palette',
  templateUrl: './command-palette.component.html',
  styleUrls: ['./command-palette.component.scss']
})
export class CommandPaletteComponent implements OnInit, OnDestroy {
  @ViewChild('paletteInput') paletteInput?: ElementRef<HTMLInputElement>;

  isOpen = false;
  query = '';
  results: PaletteItem[] = [];
  activeIndex = 0;
  isRecentView = true;

  private sub?: Subscription;

  constructor(private paletteService: CommandPaletteService) {}

  ngOnInit(): void {
    this.sub = this.paletteService.open$.subscribe(open => {
      this.isOpen = open;
      if (open) {
        this.query = '';
        this.refresh();
        setTimeout(() => this.paletteInput?.nativeElement.focus());
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  refresh(): void {
    this.isRecentView = !this.query.trim();
    this.results = this.paletteService.search(this.query);
    this.activeIndex = 0;
  }

  select(item: PaletteItem): void {
    this.paletteService.run(item);
  }

  close(): void {
    this.paletteService.close();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, this.results.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.results[this.activeIndex]) this.select(this.results[this.activeIndex]);
        break;
    }
  }

  kindLabel(kind: PaletteItem['kind']): string {
    const labels: Record<PaletteItem['kind'], string> = {
      route: 'Go to', action: 'Action', pattern: 'Pattern', problem: 'Problem', company: 'Company'
    };
    return labels[kind];
  }
}
