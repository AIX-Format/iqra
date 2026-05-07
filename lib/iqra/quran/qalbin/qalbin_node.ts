/**
 * 🌙 Qalbin (قلبِن) Node Definitions
 * 
 * The fundamental building blocks of the Qalbin language.
 * Merging Interaction Combinators with the 7 Quranic Meta-Loops.
 */

export type QalbinKind = 'ALIF' | 'LAM' | 'MIM';

/**
 * The 7 Graded Modalities (Meta-Loops) of Qalbin
 */
export enum Modality {
  RAHMA  = 'RAHMA',  // Mercy: Fault tolerance & recovery
  HAMD   = 'HAMD',   // Praise: Data provenance & gratitude
  ADL    = 'ADL',    // Justice: Auditability & fairness
  IKHLAS = 'IKHLAS', // Sincerity: Purpose alignment (No dark patterns)
  HIDAYA = 'HIDAYA', // Guidance: Pathfinding & Spectrum of Consequences
  MIZAN  = 'MIZAN',  // Balance: Utilitarian weight & harm prevention
  AMAN   = 'AMAN',   // Safety: Trust ceilings & mandatory doubt
}

export interface QalbinNode {
  id: number;
  kind: QalbinKind;
  modality: Modality;
  ports: (number | null)[]; // Port 0 is Principal Port
  metadata: Record<string, any>;
}

export interface InteractionRule {
  apply(a: QalbinNode, b: QalbinNode): QalbinNode[];
}
