// Phase B — the Visualizer Engine's core model. Every algorithm is a pure
// function returning a Trace; the shared <viz-player> drives playback and a
// structure-kind renderer draws each frame. Adding a new algorithm means
// writing a trace generator, not new UI.

export type StructureKind = 'array' | 'stack' | 'linked-list' | 'tree' | 'trie' | 'graph' | 'grid';

export interface Highlight {
  kind: 'index' | 'node' | 'edge' | 'cell' | 'range' | 'stackTop';
  index?: number;
  id?: string;
  from?: number;
  to?: number;
  row?: number;
  col?: number;
  tone?: 'active' | 'settled' | 'compare' | 'answer' | 'dim';
}

export interface Pointer {
  name: string;
  index?: number;
  id?: string;
  color?: string;
}

export interface ArrayState { values: (number | string)[]; }
export interface StackState { array: (number | string)[]; stack: (number | string)[]; }
export interface LinkedListNode { id: string; value: number | string; next: string | null; }
export interface LinkedListState { nodes: LinkedListNode[]; headId: string | null; }
export interface TreeNode { id: string; value: number | string; left: string | null; right: string | null; }
export interface TreeState { nodes: TreeNode[]; rootId: string | null; }
export interface TrieNode { id: string; char: string; children: Record<string, string>; isEnd: boolean; }
export interface TrieState { nodes: TrieNode[]; rootId: string; }
export interface GraphNode { id: string; label: string; x: number; y: number; }
export interface GraphEdge { from: string; to: string; weight?: number; }
export interface GraphState { nodes: GraphNode[]; edges: GraphEdge[]; directed?: boolean; }
export interface GridState { cells: (number | string | null)[][]; rows: number; cols: number; }

export type FrameState =
  | ArrayState | StackState | LinkedListState | TreeState | TrieState | GraphState | GridState;

export interface Frame {
  step: number;
  explanation: string;
  state: FrameState;
  highlights: Highlight[];
  pointers: Pointer[];
  vars: Record<string, string | number | boolean>;
  codeLine?: number;
}

export interface Trace {
  structure: StructureKind;
  frames: Frame[];
  code: string;
}

export interface VisualizerPreset {
  label: string;
  input: unknown;
}

export interface VisualizerDef {
  slug: string;
  title: string;
  patternSlug?: string;
  structure: StructureKind;
  description: string;
  presets: VisualizerPreset[];
  customInputLabel: string;
  parseCustomInput: (raw: string) => unknown;
  generate: (input: any) => Trace;
}
