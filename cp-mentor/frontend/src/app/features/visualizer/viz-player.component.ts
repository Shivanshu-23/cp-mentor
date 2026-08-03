import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Trace, Frame } from './model';
import { ArrayRendererComponent } from './renderers/array-renderer.component';
import { StackRendererComponent } from './renderers/stack-renderer.component';
import { LinkedListRendererComponent } from './renderers/linked-list-renderer.component';
import { TreeRendererComponent } from './renderers/tree-renderer.component';
import { TrieRendererComponent } from './renderers/trie-renderer.component';
import { GraphRendererComponent } from './renderers/graph-renderer.component';
import { GridRendererComponent } from './renderers/grid-renderer.component';

@Component({
  selector: 'app-viz-player',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, ArrayRendererComponent, StackRendererComponent,
    LinkedListRendererComponent, TreeRendererComponent, TrieRendererComponent,
    GraphRendererComponent, GridRendererComponent
  ],
  templateUrl: './viz-player.component.html',
  styleUrls: ['./viz-player.component.scss']
})
export class VizPlayerComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() trace!: Trace;
  @Input() autoFocus = false;

  @ViewChild('playerRoot') playerRoot?: ElementRef<HTMLElement>;

  currentIndex = 0;
  playing = false;
  speed: 0.5 | 1 | 2 = 1;

  private readonly BASE_INTERVAL_MS = 900;
  private timerId?: ReturnType<typeof setInterval>;
  private reducedMotion = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trace']) {
      this.currentIndex = 0;
      this.pause();
    }
  }

  ngAfterViewInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.autoFocus) this.playerRoot?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  get frame(): Frame {
    return this.trace.frames[this.currentIndex];
  }

  get codeLines(): string[] {
    return this.trace.code.split('\n');
  }

  get progressPct(): number {
    const last = this.trace.frames.length - 1;
    return last <= 0 ? 100 : (this.currentIndex / last) * 100;
  }

  get isFirst(): boolean { return this.currentIndex === 0; }
  get isLast(): boolean { return this.currentIndex === this.trace.frames.length - 1; }

  play(): void {
    if (this.isLast) this.currentIndex = 0;
    this.playing = true;
    this.clearTimer();
    // reduced-motion collapses playback to instant frame jumps, per the brief
    const interval = this.reducedMotion ? 0 : this.BASE_INTERVAL_MS / this.speed;
    this.timerId = setInterval(() => {
      if (this.isLast) { this.pause(); return; }
      this.currentIndex++;
    }, Math.max(interval, 1));
  }

  pause(): void {
    this.playing = false;
    this.clearTimer();
  }

  toggle(): void {
    this.playing ? this.pause() : this.play();
  }

  stepForward(): void {
    this.pause();
    this.currentIndex = Math.min(this.currentIndex + 1, this.trace.frames.length - 1);
  }

  stepBack(): void {
    this.pause();
    this.currentIndex = Math.max(this.currentIndex - 1, 0);
  }

  reset(): void {
    this.pause();
    this.currentIndex = 0;
  }

  setSpeed(s: number): void {
    this.speed = s as 0.5 | 1 | 2;
    if (this.playing) this.play(); // restart interval at new speed
  }

  scrub(event: Event): void {
    this.pause();
    const pct = Number((event.target as HTMLInputElement).value);
    const last = this.trace.frames.length - 1;
    this.currentIndex = Math.round((pct / 100) * last);
  }

  jumpToPercent(tenth: number): void {
    this.pause();
    const last = this.trace.frames.length - 1;
    this.currentIndex = Math.round((tenth / 10) * last);
  }

  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.toggle();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.stepForward();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.stepBack();
        break;
      case 'r':
        event.preventDefault();
        this.reset();
        break;
      default:
        if (/^[0-9]$/.test(event.key)) {
          event.preventDefault();
          this.jumpToPercent(Number(event.key));
        }
    }
  }

  varEntries(): [string, string | number | boolean][] {
    return Object.entries(this.frame.vars ?? {});
  }

  private clearTimer(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = undefined;
  }
}
