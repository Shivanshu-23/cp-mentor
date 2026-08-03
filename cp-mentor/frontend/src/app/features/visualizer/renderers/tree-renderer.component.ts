import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeState, Highlight, Pointer } from '../model';

interface LaidOutTreeNode { id: string; value: number | string; x: number; y: number; parentId: string | null; }

@Component({
  selector: 'app-tree-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tree-renderer.component.html',
  styleUrls: ['./tree-renderer.component.scss']
})
export class TreeRendererComponent {
  @Input() state!: TreeState;
  @Input() highlights: Highlight[] = [];
  @Input() pointers: Pointer[] = [];

  readonly nodeR = 20;
  readonly xSpacing = 52;
  readonly ySpacing = 64;

  get laidOut(): LaidOutTreeNode[] {
    const byId = new Map(this.state.nodes.map(n => [n.id, n]));
    const out: LaidOutTreeNode[] = [];
    let cursor = 0;

    const visit = (id: string | null, depth: number, parentId: string | null) => {
      if (!id || !byId.has(id)) return;
      const node = byId.get(id)!;
      visit(node.left, depth + 1, id);
      out.push({ id: node.id, value: node.value, x: cursor * this.xSpacing, y: depth * this.ySpacing, parentId });
      cursor++;
      visit(node.right, depth + 1, id);
    };

    visit(this.state.rootId, 0, null);
    return out;
  }

  toneFor(id: string): string {
    return this.highlights.find(h => h.kind === 'node' && h.id === id)?.tone ?? 'none';
  }

  orderLabel(id: string): number | null {
    const hit = this.highlights.find(h => h.kind === 'node' && h.id === id && h.tone === 'settled');
    return hit?.index ?? null;
  }

  pointersAt(id: string): Pointer[] {
    return this.pointers.filter(p => p.id === id);
  }

  edges(): { x1: number; y1: number; x2: number; y2: number }[] {
    const byId = new Map(this.laidOut.map(n => [n.id, n]));
    return this.laidOut
      .filter(n => n.parentId && byId.has(n.parentId))
      .map(n => {
        const parent = byId.get(n.parentId!)!;
        return { x1: parent.x, y1: parent.y, x2: n.x, y2: n.y };
      });
  }

  get viewBox(): string {
    const xs = this.laidOut.map(n => n.x);
    const ys = this.laidOut.map(n => n.y);
    const minX = Math.min(0, ...xs) - this.nodeR - 4;
    const maxX = Math.max(this.xSpacing, ...xs) + this.nodeR + 4;
    const maxY = Math.max(this.ySpacing, ...ys) + this.nodeR + 20;
    return `${minX} -10 ${maxX - minX} ${maxY + 10}`;
  }

  get svgHeight(): number {
    const ys = this.laidOut.map(n => n.y);
    return Math.max(...ys, 0) + this.nodeR * 2 + 30;
  }
}
