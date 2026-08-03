import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkedListState, Highlight, Pointer } from '../model';

interface LaidOutNode { id: string; value: number | string; x: number; hasNext: boolean; }

@Component({
  selector: 'app-linked-list-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './linked-list-renderer.component.html',
  styleUrls: ['./linked-list-renderer.component.scss']
})
export class LinkedListRendererComponent {
  @Input() state!: LinkedListState;
  @Input() highlights: Highlight[] = [];
  @Input() pointers: Pointer[] = [];

  readonly nodeW = 56;
  readonly gap = 36;

  get laidOut(): LaidOutNode[] {
    // Walk from head so a cycle (fast/slow detection) doesn't loop forever —
    // cap at 2x node count, matching "the loop drawn explicitly" from the brief.
    const byId = new Map(this.state.nodes.map(n => [n.id, n]));
    const out: LaidOutNode[] = [];
    let cur = this.state.headId;
    const seen = new Set<string>();
    let x = 0;
    while (cur && byId.has(cur) && out.length < this.state.nodes.length * 2) {
      const node = byId.get(cur)!;
      out.push({ id: node.id, value: node.value, x, hasNext: !!node.next });
      x += this.nodeW + this.gap;
      if (seen.has(cur)) break; // cycle — stop after drawing it once more
      seen.add(cur);
      cur = node.next;
    }
    return out;
  }

  toneFor(id: string): string {
    return this.highlights.find(h => h.kind === 'node' && h.id === id)?.tone ?? 'none';
  }

  pointersAt(id: string): Pointer[] {
    return this.pointers.filter(p => p.id === id);
  }

  get viewBoxWidth(): number {
    const n = this.laidOut.length;
    return Math.max(n * (this.nodeW + this.gap) - this.gap, this.nodeW) + 10;
  }

  // A cycle shows up as: the last drawn node's real `next` points to an id
  // that already appeared earlier in the walk. Precomputed once per frame
  // rather than recomputed per-node in the template.
  get cycleBackEdge(): { fromX: number; toX: number } | null {
    const out = this.laidOut;
    if (out.length < 2) return null;
    const last = out[out.length - 1];
    const realNext = this.state.nodes.find(n => n.id === last.id)?.next;
    if (!realNext) return null;
    const targetIdx = out.findIndex(l => l.id === realNext);
    if (targetIdx < 0 || targetIdx === out.length - 1) return null;
    return { fromX: last.x + this.nodeW / 2, toX: out[targetIdx].x + this.nodeW / 2 };
  }
}
