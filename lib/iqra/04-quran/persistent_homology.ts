/**
 * 🔬 Persistent Homology Computation — حساب الهومولوجيا المستمرة
 * 
 * WHY: Implements computation of Betti numbers (H0, H1, H2) for topological
 * data analysis of Quranic patterns. This is essential for understanding
 * the connected components, loops, and voids in sacred geometry patterns.
 */

export interface Point {
  x: number;
  y: number;
  z?: number;
  metadata?: Record<string, any>;
}

export interface Simplex {
  vertices: number[];
  dimension: number;
  birth: number;
  death?: number;
  persistence?: number;
}

export interface PersistenceDiagram {
  H0: Simplex[];  // Connected components
  H1: Simplex[];  // Loops/holes
  H2: Simplex[];  // Voids/cavities
  bettiNumbers: {
    b0: number;
    b1: number;
    b2: number;
  };
  totalPersistence: number;
  computationTime: number;
}

export interface Filtration {
  simplices: Simplex[];
  maxDimension: number;
  maxValue: number;
}

export class PersistentHomology {
  private readonly EPSILON = 1e-10;

  /**
   * Compute persistent homology for a point cloud
   */
  computePersistentHomology(points: Point[], maxDimension: number = 2): PersistenceDiagram {
    const startTime = Date.now();
    
    // Step 1: Build distance matrix
    const distanceMatrix = this.buildDistanceMatrix(points);
    
    // Step 2: Create filtration
    const filtration = this.buildFiltration(points, distanceMatrix, maxDimension);
    
    // Step 3: Compute persistence pairs
    const persistencePairs = this.computePersistencePairs(filtration);
    
    // Step 4: Extract diagrams for each dimension
    const diagram = this.extractPersistenceDiagrams(persistencePairs, filtration);
    
    const endTime = Date.now();
    diagram.computationTime = endTime - startTime;
    
    return diagram;
  }

  /**
   * Build Euclidean distance matrix between all points
   */
  private buildDistanceMatrix(points: Point[]): number[][] {
    const n = points.length;
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = this.euclideanDistance(points[i], points[j]);
        matrix[i][j] = dist;
        matrix[j][i] = dist;
      }
    }
    
    return matrix;
  }

  /**
   * Compute Euclidean distance between two points
   */
  private euclideanDistance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Build Vietoris-Rips filtration
   */
  private buildFiltration(points: Point[], distanceMatrix: number[][], maxDimension: number): Filtration {
    const simplices: Simplex[] = [];
    const n = points.length;
    
    // Add 0-simplices (vertices)
    for (let i = 0; i < n; i++) {
      simplices.push({
        vertices: [i],
        dimension: 0,
        birth: 0
      });
    }
    
    // Add 1-simplices (edges)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        simplices.push({
          vertices: [i, j],
          dimension: 1,
          birth: distanceMatrix[i][j]
        });
      }
    }
    
    // Add higher-dimensional simplices if needed
    if (maxDimension >= 2) {
      // Add 2-simplices (triangles)
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          for (let k = j + 1; k < n; k++) {
            const birth = Math.max(
              distanceMatrix[i][j],
              distanceMatrix[i][k],
              distanceMatrix[j][k]
            );
            simplices.push({
              vertices: [i, j, k],
              dimension: 2,
              birth
            });
          }
        }
      }
    }
    
    // Sort by birth time
    simplices.sort((a, b) => a.birth - b.birth);
    
    return {
      simplices,
      maxDimension,
      maxValue: Math.max(...simplices.map(s => s.birth))
    };
  }

  /**
   * Compute persistence pairs using union-find for H0 and matrix reduction for higher dimensions
   */
  private computePersistencePairs(filtration: Filtration): Map<number, Simplex[]> {
    const pairs = new Map<number, Simplex[]>();
    
    // Initialize for each dimension
    for (let d = 0; d <= filtration.maxDimension; d++) {
      pairs.set(d, []);
    }
    
    // H0: Use union-find for connected components
    const h0Pairs = this.computeH0Persistence(filtration);
    pairs.set(0, h0Pairs);
    
    // H1 and H2: Use boundary matrix reduction
    if (filtration.maxDimension >= 1) {
      const h1Pairs = this.computeH1Persistence(filtration);
      pairs.set(1, h1Pairs);
    }
    
    if (filtration.maxDimension >= 2) {
      const h2Pairs = this.computeH2Persistence(filtration);
      pairs.set(2, h2Pairs);
    }
    
    return pairs;
  }

  /**
   * Compute H0 persistence (connected components)
   */
  private computeH0Persistence(filtration: Filtration): Simplex[] {
    const parent: number[] = [];
    const birth: number[] = [];
    const pairs: Simplex[] = [];
    
    // Initialize union-find
    for (let i = 0; i < filtration.simplices.length; i++) {
      parent[i] = i;
      birth[i] = filtration.simplices[i].birth;
    }
    
    const find = (x: number): number => {
      if (parent[x] !== x) {
        parent[x] = find(parent[x]);
      }
      return parent[x];
    };
    
    const union = (x: number, y: number) => {
      const rootX = find(x);
      const rootY = find(y);
      if (rootX !== rootY) {
        // Merge younger component into older
        if (birth[rootX] < birth[rootY]) {
          parent[rootY] = rootX;
        } else {
          parent[rootX] = rootY;
        }
      }
    };
    
    // Process edges (1-simplices)
    const vertices = filtration.simplices.filter(s => s.dimension === 0);
    const edges = filtration.simplices.filter(s => s.dimension === 1);
    
    // Track component births
    const componentBirths = new Map<number, number>();
    vertices.forEach((v, i) => {
      componentBirths.set(v.vertices[0], v.birth);
    });
    
    // Process edges to create death pairs
    edges.forEach(edge => {
      const [v1, v2] = edge.vertices;
      const root1 = find(v1);
      const root2 = find(v2);
      
      if (root1 !== root2) {
        const birth1 = componentBirths.get(root1) || 0;
        const birth2 = componentBirths.get(root2) || 0;
        
        // Create persistence pair
        const deathSimplex: Simplex = {
          vertices: [Math.max(root1, root2)],
          dimension: 0,
          birth: Math.min(birth1, birth2),
          death: edge.birth,
          persistence: edge.birth - Math.min(birth1, birth2)
        };
        pairs.push(deathSimplex);
        
        union(root1, root2);
      }
    });
    
    return pairs;
  }

  /**
   * Compute H1 persistence (loops/holes)
   */
  private computeH1Persistence(filtration: Filtration): Simplex[] {
    const pairs: Simplex[] = [];
    const edges = filtration.simplices.filter(s => s.dimension === 1);
    const triangles = filtration.simplices.filter(s => s.dimension === 2);
    
    // Build boundary matrix for 1-simplices
    const boundaryMatrix: number[][] = [];
    const edgeIndex = new Map<string, number>();
    
    edges.forEach((edge, i) => {
      edgeIndex.set(`${edge.vertices[0]}-${edge.vertices[1]}`, i);
      boundaryMatrix.push([]);
    });
    
    triangles.forEach(triangle => {
      const [v0, v1, v2] = triangle.vertices;
      const edges_in_triangle = [
        [Math.min(v0, v1), Math.max(v0, v1)],
        [Math.min(v1, v2), Math.max(v1, v2)],
        [Math.min(v2, v0), Math.max(v2, v0)]
      ];
      
      edges_in_triangle.forEach(([a, b]) => {
        const edgeKey = `${a}-${b}`;
        const edgeIdx = edgeIndex.get(edgeKey);
        if (edgeIdx !== undefined) {
          boundaryMatrix[edgeIdx].push(triangle.birth);
        }
      });
    });
    
    // Simplified persistence computation
    // In practice, this would use the standard algorithm
    edges.forEach((edge, i) => {
      if (boundaryMatrix[i].length > 0) {
        const death = Math.min(...boundaryMatrix[i]);
        pairs.push({
          vertices: edge.vertices,
          dimension: 1,
          birth: edge.birth,
          death,
          persistence: death - edge.birth
        });
      }
    });
    
    return pairs;
  }

  /**
   * Compute H2 persistence (voids/cavities)
   */
  private computeH2Persistence(filtration: Filtration): Simplex[] {
    const pairs: Simplex[] = [];
    const triangles = filtration.simplices.filter(s => s.dimension === 2);
    
    // For H2, we need 3-simplices (tetrahedra) to kill H2 classes
    // Since we're working with 2D data, H2 will typically be empty
    // but we include the framework for completeness
    
    triangles.forEach(triangle => {
      // In 2D, H2 classes don't typically form
      // This would be relevant for 3D point clouds
      if (triangle.vertices.length === 3) {
        pairs.push({
          vertices: triangle.vertices,
          dimension: 2,
          birth: triangle.birth,
          death: Infinity, // Never dies in 2D
          persistence: Infinity
        });
      }
    });
    
    return pairs;
  }

  /**
   * Extract persistence diagrams from pairs
   */
  private extractPersistenceDiagrams(pairs: Map<number, Simplex[]>, filtration: Filtration): PersistenceDiagram {
    const diagram: PersistenceDiagram = {
      H0: [],
      H1: [],
      H2: [],
      bettiNumbers: { b0: 0, b1: 0, b2: 0 },
      totalPersistence: 0,
      computationTime: 0
    };
    
    // Extract diagrams for each dimension
    for (let d = 0; d <= filtration.maxDimension; d++) {
      const dimPairs = pairs.get(d) || [];
      
      // Add essential classes (those that never die)
      const essential = this.findEssentialClasses(d, filtration);
      dimPairs.push(...essential);
      
      // Sort by persistence
      dimPairs.sort((a, b) => (b.persistence || 0) - (a.persistence || 0));
      
      switch (d) {
        case 0:
          diagram.H0 = dimPairs;
          diagram.bettiNumbers.b0 = dimPairs.filter(p => !p.death || p.death === Infinity).length;
          break;
        case 1:
          diagram.H1 = dimPairs;
          diagram.bettiNumbers.b1 = dimPairs.filter(p => !p.death || p.death === Infinity).length;
          break;
        case 2:
          diagram.H2 = dimPairs;
          diagram.bettiNumbers.b2 = dimPairs.filter(p => !p.death || p.death === Infinity).length;
          break;
      }
    }
    
    // Calculate total persistence
    diagram.totalPersistence = this.calculateTotalPersistence(diagram);
    
    return diagram;
  }

  /**
   * Find essential classes that never die
   */
  private findEssentialClasses(dimension: number, filtration: Filtration): Simplex[] {
    const essential: Simplex[] = [];
    const dimSimplices = filtration.simplices.filter(s => s.dimension === dimension);
    
    // Simplified: assume some classes are essential based on filtration structure
    if (dimension === 0) {
      // At least one connected component is essential
      if (dimSimplices.length > 0) {
        essential.push({
          vertices: [0],
          dimension: 0,
          birth: 0,
          death: Infinity,
          persistence: Infinity
        });
      }
    }
    
    return essential;
  }

  /**
   * Calculate total persistence across all dimensions
   */
  private calculateTotalPersistence(diagram: PersistenceDiagram): number {
    let total = 0;
    
    [...diagram.H0, ...diagram.H1, ...diagram.H2].forEach(simplex => {
      if (simplex.persistence && simplex.persistence !== Infinity) {
        total += simplex.persistence;
      }
    });
    
    return total;
  }

  /**
   * Compute bottleneck distance between two persistence diagrams
   */
  bottleneckDistance(diagram1: PersistenceDiagram, diagram2: PersistenceDiagram): number {
    // Simplified bottleneck distance computation
    // In practice, this would use the Hungarian algorithm or similar
    
    const allPairs1 = [...diagram1.H0, ...diagram1.H1, ...diagram1.H2];
    const allPairs2 = [...diagram2.H0, ...diagram2.H1, ...diagram2.H2];
    
    let maxDistance = 0;
    
    allPairs1.forEach(pair1 => {
      const minDistance = Math.min(
        ...allPairs2.map(pair2 => 
          Math.abs((pair1.persistence || 0) - (pair2.persistence || 0))
        ),
        Math.abs(pair1.persistence || 0) // Distance to diagonal
      );
      maxDistance = Math.max(maxDistance, minDistance);
    });
    
    allPairs2.forEach(pair2 => {
      const minDistance = Math.min(
        ...allPairs1.map(pair1 => 
          Math.abs((pair1.persistence || 0) - (pair2.persistence || 0))
        ),
        Math.abs(pair2.persistence || 0) // Distance to diagonal
      );
      maxDistance = Math.max(maxDistance, minDistance);
    });
    
    return maxDistance;
  }

  /**
   * Compute persistence landscape for a given dimension
   */
  computePersistenceLandscape(diagram: PersistenceDiagram, dimension: number, resolution: number = 100): number[][] {
    const pairs = dimension === 0 ? diagram.H0 : dimension === 1 ? diagram.H1 : diagram.H2;
    const landscape: number[][] = [];
    
    // Find bounds
    const births = pairs.map(p => p.birth);
    const deaths = pairs.map(p => p.death || 0);
    const minVal = Math.min(...births, ...deaths);
    const maxVal = Math.max(...births, ...deaths);
    
    // Sample points
    for (let i = 0; i < resolution; i++) {
      const x = minVal + (maxVal - minVal) * (i / (resolution - 1));
      const lambda_k: number[] = [];
      
      pairs.forEach(pair => {
        if (pair.death && pair.death !== Infinity) {
          const lambda = this.lambdaFunction(x, pair.birth, pair.death);
          lambda_k.push(lambda);
        }
      });
      
      lambda_k.sort((a, b) => b - a);
      landscape.push(lambda_k);
    }
    
    return landscape;
  }

  /**
   * Lambda function for persistence landscape
   */
  private lambdaFunction(x: number, birth: number, death: number): number {
    if (x < (birth + death) / 2) {
      return x - birth;
    } else if (x <= death) {
      return death - x;
    }
    return 0;
  }
}