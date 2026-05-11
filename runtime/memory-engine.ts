/**
 * 🧠 Memory Engine — محرك الذاكرة التكيفي
 * 
 * Implements Episodic, Semantic, Failure, and Reflection memory.
 * "Governed Adaptive Memory" as per latest cognitive research.
 */

import * as fs from 'fs';
import * as path from 'path';

export enum MemoryType {
  EPISODIC = 'sessions',
  SEMANTIC = 'patterns',
  FAILURE = 'failures',
  REFLECTION = 'reflections'
}

export class MemoryEngine {
  private baseDir: string = '.iqra';
  private indexFile: string = '.iqra/memory_index.json';

  constructor(baseDir: string = '.iqra') {
    this.baseDir = baseDir;
  }

  /**
   * Save a memory episode or pattern
   */
  public async save(type: MemoryType, id: string, data: any, tags: string[] = []): Promise<void> {
    const filePath = path.join(this.baseDir, type, `${id}.json`);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const memoryEntry = {
      ...data,
      tags,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(memoryEntry, null, 2));
    
    // Update index
    this.updateIndex(id, type, tags);

    // Also log to the central knowledge files if it's a critical discovery or failure
    if (type === MemoryType.FAILURE) {
      this.appendToFile('knowledge/FAILURES.md', `- [${new Date().toISOString()}] ${id}: ${data.summary || data.error}`);
    }
  }

  /**
   * Retrieve relevant memories for context
   */
  public async retrieve(type: MemoryType, query: string, tags: string[] = []): Promise<any[]> {
    const dir = path.join(this.baseDir, type);
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir);
    const memories = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

    // Simple keyword and tag filtering
    return memories.filter(m => {
      const matchesTags = tags.length === 0 || tags.some(t => m.tags?.includes(t));
      const matchesQuery = !query || JSON.stringify(m).toLowerCase().includes(query.toLowerCase());
      return matchesTags && matchesQuery;
    });
  }

  private updateIndex(id: string, type: MemoryType, tags: string[]): void {
    let index: any = {};
    if (fs.existsSync(this.indexFile)) {
      index = JSON.parse(fs.readFileSync(this.indexFile, 'utf8'));
    }

    index[id] = { type, tags, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(this.indexFile, JSON.stringify(index, null, 2));
  }

  private appendToFile(filePath: string, text: string): void {
    const fullPath = path.join(process.cwd(), filePath);
    fs.appendFileSync(fullPath, `${text}\n`);
  }
}
