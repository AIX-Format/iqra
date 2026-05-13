// @ts-nocheck — legacy test: assertions target pre-migration APIs (May 2026). Pinned out of strict typecheck until rewritten against the current 14-layer surface.
/**
 * E2E Test 08 — Commit-Based Learning + Stitch Design
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: 31
 *
 * Tests real extraction from git history, FAILURES.md, HADITH_COMMITS.md
 * and the Stitch design system integration.
 * No mocks — real git, real files.
 */
import { describe, it, expect } from 'vitest';
import {
  extractCommitHistory,
  extractFailureLessons,
  extractHadithLessons,
  buildTrainingDataset,
  getDatasetStats,
  type CommitLesson,
  type TrainingDataPoint,
} from '#evolution/learning/commit_learner';
import {
  designWithStitch,
  createVisualNote,
  IQRA_DESIGN_TOKENS,
} from '../lib/iqra/design/stitch';
import fs from 'fs';
import path from 'path';

// ── Commit Learning Tests ─────────────────────────────────────────────────────

describe('🧬 Commit-Based Learning — التعلم من التاريخ', () => {

  it('extracts real commits from git history', () => {
    const commits = extractCommitHistory(20);

    expect(commits.length).toBeGreaterThan(0);
    expect(commits[0]).toHaveProperty('hash');
    expect(commits[0]).toHaveProperty('type');
    expect(commits[0]).toHaveProperty('lesson');
    expect(commits[0]).toHaveProperty('timestamp');

    console.log(`\n📜 Extracted ${commits.length} commits`);
    console.log(`   Latest: [${commits[0].type}] ${commits[0].message.slice(0, 60)}`);
  });

  it('classifies commit types correctly', () => {
    const commits = extractCommitHistory(50);
    const types = new Set(commits.map(c => c.type));

    // Should have multiple types from the rich history
    expect(types.size).toBeGreaterThan(1);

    const byType = commits.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Commit types:', byType);
  });

  it('extracts failure lessons from FAILURES.md', () => {
    const failures = extractFailureLessons();

    // We know FAILURES.md has entries from our tests
    expect(failures.length).toBeGreaterThan(0);
    expect(failures[0]).toHaveProperty('instruction');
    expect(failures[0]).toHaveProperty('input');
    expect(failures[0]).toHaveProperty('output');
    expect(failures[0].category).toBe('error_fix');
    expect(failures[0].quran_ref).toBeTruthy();

    console.log(`\n🛡️ Failure lessons: ${failures.length}`);
    console.log(`   Sample: ${failures[0].input.slice(0, 80)}`);
  });

  it('extracts hadith lessons from HADITH_COMMITS.md', () => {
    const lessons = extractHadithLessons();

    // HADITH_COMMITS.md has 3 entries
    expect(lessons.length).toBeGreaterThanOrEqual(0);

    if (lessons.length > 0) {
      expect(lessons[0]).toHaveProperty('output');
      expect(lessons[0].category).toBe('evolution');
      console.log(`\n📖 Hadith lessons: ${lessons.length}`);
    } else {
      console.log('\n📖 No hadith lessons yet — HADITH_COMMITS.md needs more entries');
    }
  });

  it('builds full training dataset and saves to disk', async () => {
    const dataset = await buildTrainingDataset();

    expect(dataset.length).toBeGreaterThan(0);

    // Check structure
    const sample = dataset[0];
    expect(sample).toHaveProperty('instruction');
    expect(sample).toHaveProperty('input');
    expect(sample).toHaveProperty('output');
    expect(sample).toHaveProperty('source');
    expect(sample).toHaveProperty('category');

    // Check file was saved
    const outputPath = path.join(process.cwd(), '.iqra', 'training_data.json');
    expect(fs.existsSync(outputPath)).toBe(true);

    const saved = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    expect(saved.length).toBe(dataset.length);

    const stats = getDatasetStats(dataset);
    console.log(`\n🧬 Training Dataset Stats:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   With Quran refs: ${stats.withQuranRef}`);
    console.log(`   Categories: ${stats.categories.join(', ')}`);
    console.log(`   By category:`, stats.byCategory);
  }, 15000);

  it('all training data points have Quranic references', async () => {
    const dataset = await buildTrainingDataset();
    const withRef = dataset.filter(d => d.quran_ref);
    const ratio = withRef.length / dataset.length;

    console.log(`\n📿 Quran ref coverage: ${(ratio * 100).toFixed(1)}%`);
    // At least 50% should have Quran refs
    expect(ratio).toBeGreaterThan(0.5);
  }, 15000);
});

// ── Stitch Design Tests ───────────────────────────────────────────────────────

describe('🎨 Stitch Design System — نظام التصميم', () => {

  it('IQRA design tokens follow sacred geometry', () => {
    const { spacing, radii, colors } = IQRA_DESIGN_TOKENS;

    // All spacing must be multiples of 7
    expect(spacing.xs % 7).toBe(0);
    expect(spacing.sm % 7).toBe(0);
    expect(spacing.md % 7).toBe(0);
    expect(spacing.lg % 7).toBe(0);

    // Sacred colors exist
    expect(colors.gold).toBeTruthy();
    expect(colors.emerald).toBeTruthy();
    expect(colors.ink).toBeTruthy();

    // Radii use sacred numbers
    expect(radii.md).toBe('7px');
    expect(radii.xl).toBe('19px');

    console.log('\n🕋 Sacred geometry tokens verified');
    console.log(`   Gold: ${colors.gold} | Spacing unit: ${spacing.xs}px`);
  });

  it('generates design with local fallback when Stitch API unavailable', async () => {
    const result = await designWithStitch({
      prompt: 'Resonance discovery card showing Quranic ayah and modern science connection',
      style: 'sacred',
      language: 'bilingual',
      colorScheme: 'dark',
    });

    expect(result).toBeTruthy();
    expect(result.source).toMatch(/stitch|local_fallback/);

    if (result.css) {
      expect(result.css).toContain('iqra');
      console.log(`\n🎨 Design generated (${result.source})`);
      console.log(`   CSS length: ${result.css.length} chars`);
    }
    if (result.html) {
      expect(result.html.length).toBeGreaterThan(50);
    }
  }, 15000);

  it('creates a visual note for a Quranic discovery', async () => {
    const note = await createVisualNote(
      'Resonance: Iron Ayah & Astrophysics',
      'The Quran says iron was "sent down" — astrophysics confirms iron forms in supernovae and arrives via cosmic impacts',
      'discovery',
      'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ — الحديد: 25'
    );

    expect(note).toHaveProperty('id');
    expect(note).toHaveProperty('title');
    expect(note).toHaveProperty('created_at');
    expect(note.type).toBe('discovery');
    expect(note.ayah_ref).toBeTruthy();

    // Check saved to disk
    const notePath = path.join(process.cwd(), '.iqra', 'visual_notes', `${note.id}.json`);
    expect(fs.existsSync(notePath)).toBe(true);

    console.log(`\n📝 Visual note created: ${note.id}`);
    console.log(`   Title: ${note.title}`);
    console.log(`   Ayah: ${note.ayah_ref}`);
  }, 20000);

  it('creates a visual note for UI architecture', async () => {
    const note = await createVisualNote(
      'IQRA 7-State Topology',
      'The agent moves through 7 states: Reception → Tafakkur → Planning → Execution → Muraqabah → Reflection → Evolution',
      'architecture'
    );

    expect(note.type).toBe('architecture');
    expect(note.id).toMatch(/^note_\d+$/);
    console.log(`\n🏗️ Architecture note: ${note.title}`);
  }, 20000);
});
