/**
 * 🌙 QAL VM — آلة التفاعل القرآنية
 * 
 * Based on Interaction Combinators (Taelin/HVM) + Graded Linear Logic.
 * 
 * Core Nodes:
 * - ALIF (A): Principal Port / Pure Unity
 * - LAM (L): Delta Node / Duplication (Linear Resource Split)
 * - MIM (M): Epsilon Node / Erasure (Resource Consumption)
 * 
 * Graded Modalities (Damir Layer):
 * - TRUSTWORTHY: High resonance, low entropy.
 * - CAUTIOUS: Potential violation, requires proof.
 * - FORBIDDEN: Symmetry break, triggers Tawbah.
 */

import { SovereignError } from '../security';

export type NodeKind = 'ALIF' | 'LAM' | 'MIM';
export type Grade = 'TRUSTWORTHY' | 'CAUTIOUS' | 'FORBIDDEN';

export interface QALNode {
  kind: NodeKind;
  ports: (number | null)[]; // Indices to other nodes
  grade: Grade;
}

export class QAL_VirtualMachine {
  private nodes: QALNode[] = [];
  private activePairs: [number, number][] = [];

  /**
   * Instantiate a new interaction node
   */
  createNode(kind: NodeKind, grade: Grade = 'TRUSTWORTHY'): number {
    const id = this.nodes.length;
    this.nodes.push({ kind, ports: [null, null, null], grade });
    return id;
  }

  /**
   * Connect two ports
   */
  link(nodeA: number, portA: number, nodeB: number, portB: number) {
    this.nodes[nodeA].ports[portA] = nodeB;
    this.nodes[nodeB].ports[portB] = nodeA;

    // If both are principal ports (port 0), it's an active pair
    if (portA === 0 && portB === 0) {
      this.activePairs.push([nodeA, nodeB]);
    }
  }

  /**
   * Main Reduction Loop: The "Pulse" of the Machine
   */
  async reduce(): Promise<number> {
    let steps = 0;
    while (this.activePairs.length > 0) {
      const pair = this.activePairs.pop()!;
      await this.interact(pair[0], pair[1]);
      steps++;
      
      // Safety limit for recursion
      if (steps > 1000) throw new SovereignError("QAL_OVERFLOW: Infinite interaction loop detected.", "QAL_HALT", "CRITICAL");
    }
    return steps;
  }

  /**
   * Interaction Rules (The Core Logic)
   */
  private async interact(a: number, b: number) {
    const nodeA = this.nodes[a];
    const nodeB = this.nodes[b];

    // Damir Check (Graded Linear Logic)
    this.verifyDamir(nodeA, nodeB);

    if (nodeA.kind === nodeB.kind) {
      // Rule: ANN (Annihilation) — Identity Interaction
      this.annihilate(a, b);
    } else {
      // Rule: COM (Commutation) — Structure Crossing
      this.commute(a, b);
    }
  }

  private verifyDamir(a: QALNode, b: QALNode) {
    if (a.grade === 'FORBIDDEN' || b.grade === 'FORBIDDEN') {
      throw new SovereignError("DAMIR_VIOLATION: Forbidden interaction attempted.", "TAWBAH_TRIGGER", "CRITICAL");
    }
    // Graded logic: CAUTIOUS + CAUTIOUS = FORBIDDEN (Risk propagation)
    if (a.grade === 'CAUTIOUS' && b.grade === 'CAUTIOUS') {
      a.grade = 'FORBIDDEN'; // Mutation of state to reflect corruption
    }
  }

  private annihilate(a: number, b: number) {
    const nodeA = this.nodes[a];
    const nodeB = this.nodes[b];

    // Connect secondary ports together (short-circuit)
    this.shortcut(nodeA.ports[1], nodeA.ports[2], nodeB.ports[1], nodeB.ports[2]);
  }

  private commute(a: number, b: number) {
    // Structural change: Create 4 new nodes to represent the crossing
    // (Standard Interaction Combinator COM rule)
    // Placeholder for simplified graph mutation
  }

  private shortcut(p1: number | null, p2: number | null, p3: number | null, p4: number | null) {
    // Logic to wire together the ports left behind by annihilation
  }

  /**
   * Export the current topology for resonance calculation
   */
  getTopologyResonance(): number {
    const totalNodes = this.nodes.length;
    const trustworthy = this.nodes.filter(n => n.grade === 'TRUSTWORTHY').length;
    return totalNodes === 0 ? 1.0 : trustworthy / totalNodes;
  }
}
