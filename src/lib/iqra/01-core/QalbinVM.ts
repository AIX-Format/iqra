/**
 * 🧠 Qalbin VM — الآلة الافتراضية للقرآن
 * 
 * Virtual Machine for Quranic pattern processing
 * Implements topological operations on sacred text
 */

export interface QalbinNode {
  id: string;
  value: string | number;
  connections: string[];
  type: 'verse' | 'word' | 'pattern' | 'letter';
  resonance: number;
  depth: number;
}

export interface TopologicalSignature {
  nodes: QalbinNode[];
  edges: Array<{ from: string; to: string; weight: number }>;
  resonance: number;
  depth: number;
  complexity: number;
}

export class QalbinVM {
  private nodes: Map<string, QalbinNode> = new Map();
  private edges: Map<string, Array<{ from: string; to: string; weight: number }>> = new Map();
  private currentDepth: number = 3;

  /**
   * Initialize VM with default topological structure
   */
  constructor() {
    this.initializeBaseTopology();
  }

  private initializeBaseTopology() {
    // Create core nodes for Islamic numerical constants
    this.addNode('1', 1, [], 'verse', 1.0, 1);
    this.addNode('3', 3, [], 'verse', 0.9, 1);
    this.addNode('6', 6, [], 'verse', 0.8, 1);
    this.addNode('7', 7, [], 'verse', 0.95, 1);
    this.addNode('9', 9, [], 'verse', 0.85, 1);
    
    // Connect with sacred geometry (3-6-9)
    this.addEdge('1', '3', 0.5);
    this.addEdge('3', '6', 0.8);
    this.addEdge('6', '9', 0.6);
    this.addEdge('9', '1', 0.4); // Complete the cycle
  }

  /**
   * Add a node to the topological space
   */
  addNode(
    id: string, 
    value: string | number, 
    connections: string[] = [], 
    type: QalbinNode['type'] = 'pattern',
    resonance: number = 0.5,
    depth: number = 1
  ): void {
    this.nodes.set(id, {
      id,
      value,
      connections,
      type,
      resonance,
      depth
    });
  }

  /**
   * Add weighted edge between nodes
   */
  addEdge(from: string, to: string, weight: number): void {
    const edges = this.edges.get(from) || [];
    edges.push({ from, to, weight });
    this.edges.set(from, edges);
  }

  /**
   * Calculate topological signature of current state
   */
  getSignature(): TopologicalSignature {
    const nodes = Array.from(this.nodes.values());
    const edges = Array.from(this.edges.entries()).flatMap(([from, edges]) => 
      edges.map(edge => ({ ...edge, from }))
    );
    
    return {
      nodes,
      edges,
      resonance: this.calculateGlobalResonance(nodes),
      depth: this.currentDepth,
      complexity: this.calculateComplexity(nodes, edges)
    };
  }

  private calculateGlobalResonance(nodes: QalbinNode[]): number {
    if (nodes.length === 0) return 0;
    const sum = nodes.reduce((acc, node) => acc + node.resonance, 0);
    return sum / nodes.length;
  }

  private calculateComplexity(nodes: QalbinNode[], edges: any[]): number {
    // Complexity = (V + E) / (Depth + 1)
    return (nodes.length + edges.length) / (this.currentDepth + 1);
  }

  /**
   * Transform input through topological operations
   */
  transform(input: string): TopologicalSignature {
    const numbers = input.match(/\d+/g) || [];
    
    numbers.forEach((num, index) => {
      const val = parseInt(num);
      const nodeId = `pattern_${index}_${val}`;
      
      // Calculate resonance based on proximity to sacred numbers
      const nearestSacred = this.findNearestSacredNumber(val);
      const resonance = nearestSacred !== null ? 1 / (1 + Math.abs(val - nearestSacred)) : 0.1;
      
      this.addNode(nodeId, val, [], 'pattern', resonance, this.currentDepth);
      
      if (nearestSacred !== null) {
        this.addEdge(nodeId, nearestSacred.toString(), resonance);
      }
    });

    return this.getSignature();
  }

  private findNearestSacredNumber(num: number): number | null {
    const sacred = [1, 3, 6, 7, 9, 19, 40, 700];
    let nearest = null;
    let minDistance = Infinity;

    for (const sacredNum of sacred) {
      const distance = Math.abs(num - sacredNum);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = sacredNum;
      }
    }

    return nearest;
  }

  /**
   * Reset VM to initial state
   */
  reset(): void {
    this.nodes.clear();
    this.edges.clear();
    this.initializeBaseTopology();
  }
}

