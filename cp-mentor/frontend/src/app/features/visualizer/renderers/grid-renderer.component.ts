import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridState, Highlight } from '../model';

@Component({
  selector: 'app-grid-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid-renderer.component.html',
  styleUrls: ['./grid-renderer.component.scss']
})
export class GridRendererComponent {
  @Input() state!: GridState;
  @Input() highlights: Highlight[] = [];

  readonly cell = 44;
  readonly gap = 4;

  x(c: number): number { return c * (this.cell + this.gap); }
  y(r: number): number { return r * (this.cell + this.gap); }

  toneFor(r: number, c: number): string {
    const hit = this.highlights.find(h => h.kind === 'cell' && h.row === r && h.col === c);
    return hit?.tone ?? 'none';
  }

  get viewBoxWidth(): number {
    return this.state.cols * (this.cell + this.gap) - this.gap + 4;
  }

  get viewBoxHeight(): number {
    return this.state.rows * (this.cell + this.gap) - this.gap + 4;
  }

  // Arrows drawn from dependency cells into the current cell — passed as a
  // synthetic highlight of kind 'edge' with row/col as target and from/to
  // reused as the source row/col via a packed string ("r,c") for simplicity.
  get depEdges(): { fromR: number; fromC: number; toR: number; toC: number }[] {
    return this.highlights
      .filter(h => h.kind === 'edge' && h.id)
      .map(h => {
        const [fromR, fromC, toR, toC] = h.id!.split(',').map(Number);
        return { fromR, fromC, toR, toC };
      });
  }

  edgePath(e: { fromR: number; fromC: number; toR: number; toC: number }): string {
    const x1 = this.x(e.fromC) + this.cell / 2, y1 = this.y(e.fromR) + this.cell / 2;
    const x2 = this.x(e.toC) + this.cell / 2, y2 = this.y(e.toR) + this.cell / 2;
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
}
