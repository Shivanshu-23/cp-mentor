import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrieState, Highlight } from '../model';

interface LaidOutTrieNode { id: string; char: string; isEnd: boolean; x: number; y: number; }
interface TrieEdge { x1: number; y1: number; x2: number; y2: number; label: string; }

@Component({
  selector: 'app-trie-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trie-renderer.component.html',
  styleUrls: ['./trie-renderer.component.scss']
})
export class TrieRendererComponent {
  @Input() state!: TrieState;
  @Input() highlights: Highlight[] = [];

  readonly nodeR = 18;
  readonly xSpacing = 48;
  readonly ySpacing = 60;

  private layoutCache?: { positions: Map<string, { x: number; y: number }>; };

  private layout(): Map<string, { x: number; y: number }> {
    const byId = new Map(this.state.nodes.map(n => [n.id, n]));
    const positions = new Map<string, { x: number; y: number }>();
    let cursor = 0;

    const visit = (id: string, depth: number): number => {
      const node = byId.get(id);
      if (!node) return cursor * this.xSpacing;
      const childIds = Object.values(node.children);
      if (childIds.length === 0) {
        const x = cursor * this.xSpacing;
        cursor++;
        positions.set(id, { x, y: depth * this.ySpacing });
        return x;
      }
      const childXs = childIds.map(cid => visit(cid, depth + 1));
      const x = childXs.reduce((a, b) => a + b, 0) / childXs.length;
      positions.set(id, { x, y: depth * this.ySpacing });
      return x;
    };

    visit(this.state.rootId, 0);
    return positions;
  }

  get laidOut(): LaidOutTrieNode[] {
    const positions = this.layout();
    return this.state.nodes
      .filter(n => positions.has(n.id))
      .map(n => ({ id: n.id, char: n.char, isEnd: n.isEnd, ...positions.get(n.id)! }));
  }

  get edges(): TrieEdge[] {
    const positions = this.layout();
    const edges: TrieEdge[] = [];
    for (const node of this.state.nodes) {
      const from = positions.get(node.id);
      if (!from) continue;
      for (const [char, childId] of Object.entries(node.children)) {
        const to = positions.get(childId);
        if (to) edges.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, label: char });
      }
    }
    return edges;
  }

  toneFor(id: string): string {
    return this.highlights.find(h => h.kind === 'node' && h.id === id)?.tone ?? 'none';
  }

  get viewBox(): string {
    const positions = this.layout();
    const xs = [...positions.values()].map(p => p.x);
    const ys = [...positions.values()].map(p => p.y);
    const minX = Math.min(0, ...xs) - this.nodeR - 4;
    const maxX = Math.max(this.xSpacing, ...xs) + this.nodeR + 4;
    const maxY = Math.max(this.ySpacing, ...ys) + this.nodeR + 10;
    return `${minX} -10 ${maxX - minX} ${maxY + 10}`;
  }

  get svgHeight(): number {
    const positions = this.layout();
    const ys = [...positions.values()].map(p => p.y);
    return Math.max(...ys, 0) + this.nodeR * 2 + 20;
  }
}
