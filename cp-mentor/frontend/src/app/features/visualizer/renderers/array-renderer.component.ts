import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayState, Highlight, Pointer } from '../model';

@Component({
  selector: 'app-array-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './array-renderer.component.html',
  styleUrls: ['./array-renderer.component.scss']
})
export class ArrayRendererComponent {
  @Input() state!: ArrayState;
  @Input() highlights: Highlight[] = [];
  @Input() pointers: Pointer[] = [];

  readonly cellSize = 52;
  readonly cellGap = 8;

  cellX(i: number): number {
    return i * (this.cellSize + this.cellGap);
  }

  toneFor(i: number): string {
    const hit = this.highlights.find(h => h.kind === 'index' && h.index === i);
    if (hit?.tone) return hit.tone;
    const inRange = this.highlights.find(h =>
      h.kind === 'range' && h.from !== undefined && h.to !== undefined && i >= h.from && i <= h.to);
    return inRange?.tone ?? 'none';
  }

  pointersAt(i: number): Pointer[] {
    return this.pointers.filter(p => p.index === i);
  }

  get viewBoxWidth(): number {
    const n = this.state?.values?.length ?? 0;
    return Math.max(n * (this.cellSize + this.cellGap) - this.cellGap, this.cellSize) + 4;
  }
}
