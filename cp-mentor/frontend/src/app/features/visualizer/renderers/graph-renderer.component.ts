import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphState, Highlight, Pointer } from '../model';

@Component({
  selector: 'app-graph-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graph-renderer.component.html',
  styleUrls: ['./graph-renderer.component.scss']
})
export class GraphRendererComponent {
  @Input() state!: GraphState;
  @Input() highlights: Highlight[] = [];
  @Input() pointers: Pointer[] = [];

  readonly nodeR = 20;

  nodeToneFor(id: string): string {
    return this.highlights.find(h => h.kind === 'node' && h.id === id)?.tone ?? 'none';
  }

  edgeToneFor(from: string, to: string): string {
    const key1 = `${from}->${to}`, key2 = `${to}->${from}`;
    const hit = this.highlights.find(h => h.kind === 'edge' && (h.id === key1 || h.id === key2));
    return hit?.tone ?? 'none';
  }

  nodeById(id: string) {
    return this.state.nodes.find(n => n.id === id);
  }

  pointersAt(id: string): Pointer[] {
    return this.pointers.filter(p => p.id === id);
  }

  get viewBox(): string {
    const xs = this.state.nodes.map(n => n.x);
    const ys = this.state.nodes.map(n => n.y);
    const minX = Math.min(...xs) - this.nodeR - 20;
    const maxX = Math.max(...xs) + this.nodeR + 20;
    const minY = Math.min(...ys) - this.nodeR - 20;
    const maxY = Math.max(...ys) + this.nodeR + 20;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }

  get svgHeight(): number {
    const ys = this.state.nodes.map(n => n.y);
    return Math.max(...ys) - Math.min(...ys) + this.nodeR * 2 + 40;
  }

  edgeMidpoint(from: { x: number; y: number }, to: { x: number; y: number }) {
    return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  }
}
