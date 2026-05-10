import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Direct path to core and engine for isolation
const CORE_DIR = path.join(process.cwd(), 'iqra-core');
const ENGINE_PATH = path.join(process.cwd(), 'services/go-engine/main.go');

describe('IQRA Core & Engine — Offline Validation', () => {

  it('1. Soul Files Integrity: Should find all required constitution files', () => {
    const required = ['MĪTHĀQ.md', 'DASTŪR.md', 'MURĀQABAH.md', 'HISAB.md'];
    required.forEach(file => {
      const exists = fs.existsSync(path.join(CORE_DIR, file));
      expect(exists, `Missing core file: ${file}`).toBe(true);
    });
  });

  it('2. Go Engine CLI: Should analyze numerical patterns correctly', () => {
    // String with 7 characters should trigger Numerical_Symmetry_7
    const input = "1234567";
    const cmd = `go run "${ENGINE_PATH}" -mode resonance -input "${input}"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    const result = JSON.parse(output);

    expect(result.data.discovery_found).toBe(true);
    expect(result.data.patterns).toContain('Numerical_Symmetry_7');
  });

  it('3. Go Engine CLI: Should detect Sacred Identity Presence', () => {
    const input = "الله نور السموات والأرض";
    const cmd = `go run "${ENGINE_PATH}" -mode resonance -input "${input}"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    const result = JSON.parse(output);

    expect(result.data.patterns).toContain('Sacred_Identity_Presence');
    expect(result.data.coherence).toBeGreaterThan(0.8);
  });
});
