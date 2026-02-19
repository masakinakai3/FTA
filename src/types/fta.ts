export type FTANodeType = 'event' | 'gate';

export type FTAEventType = 'top_event' | 'basic_event' | 'intermediate_event' | 'undeveloped_event' | 'text_box';
export type FTAGateType = 'and_gate' | 'or_gate' | 'vote_gate' | 'inhibit_gate';

export interface FTANode {
  id: string;
  type: FTANodeType;
  subType: FTAEventType | FTAGateType;
  label: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  probability?: number;
  color?: string;
  // Component specific data can go here
}

export interface FTAEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface FTATree {
  nodes: FTANode[];
  edges: FTAEdge[];
}
