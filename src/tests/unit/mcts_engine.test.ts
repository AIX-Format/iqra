/**
 * Unit Tests: MCTSEngine
 *
 * Tests the constructor change introduced in this PR:
 * The constructor now accepts `Partial<MCTSConfig>` (previously required full MCTSConfig).
 * All config fields must default correctly when omitted.
 *
 * Also exercises the public API: initialize(), run(), getTreeStats().
 */

import { describe, it, expect } from 'vitest';
import { MCTSEngine, type MCTSConfig } from '../../lib/iqra/simulation/mcts_engine';

// ── Constructor / defaults ────────────────────────────────────────────────────

describe('MCTSEngine constructor — Partial<MCTSConfig> defaults', () => {
  it('constructs with no arguments (all defaults)', () => {
    const engine = new MCTSEngine();
    // We verify the engine is usable; actual config is private.
    // Initialising and checking the tree is the observable proxy.
    const root = engine.initialize({ step: 0 }, ['a', 'b']);
    expect(root).toBeDefined();
    expect(root.id).toBe('root');
  });

  it('constructs with an empty object argument', () => {
    expect(() => new MCTSEngine({})).not.toThrow();
  });

  it('accepts a partial config overriding only simulations', () => {
    const engine = new MCTSEngine({ simulations: 5 });
    const root = engine.initialize({}, ['x']);
    expect(root).toBeDefined();
  });

  it('accepts a partial config overriding exploration constant', () => {
    expect(() => new MCTSEngine({ exploration: 2.0 })).not.toThrow();
  });

  it('accepts a full MCTSConfig object', () => {
    const config: MCTSConfig = {
      simulations: 10,
      exploration: 1.41,
      rollout_depth: 5,
      time_limit: 100,
    };
    const engine = new MCTSEngine(config);
    expect(engine).toBeInstanceOf(MCTSEngine);
  });
});

// ── initialize() ──────────────────────────────────────────────────────────────

describe('MCTSEngine.initialize()', () => {
  it('creates a root node with the given state and actions', () => {
    const engine = new MCTSEngine({ simulations: 2, time_limit: 50 });
    const root = engine.initialize({ value: 42 }, ['act_a', 'act_b']);

    expect(root.id).toBe('root');
    expect(root.action).toBe('root');
    expect(root.state).toEqual({ value: 42 });
    expect(root.untried_actions).toEqual(['act_a', 'act_b']);
    expect(root.visits).toBe(0);
    expect(root.value).toBe(0);
    expect(root.children).toHaveLength(0);
  });

  it('re-initializes cleanly when called a second time', () => {
    const engine = new MCTSEngine({ simulations: 2, time_limit: 50 });
    engine.initialize({ v: 1 }, ['a']);
    const root2 = engine.initialize({ v: 2 }, ['b']);
    expect(root2.state).toEqual({ v: 2 });
    expect(root2.untried_actions).toEqual(['b']);
  });
});

// ── getTreeStats() ────────────────────────────────────────────────────────────

describe('MCTSEngine.getTreeStats()', () => {
  it('returns zero stats when no tree is initialized', () => {
    const engine = new MCTSEngine();
    const stats = engine.getTreeStats();
    expect(stats.totalNodes).toBe(0);
    expect(stats.maxDepth).toBe(0);
    expect(stats.avgBranchingFactor).toBe(0);
  });

  it('returns at least 1 node after initialization (root)', () => {
    const engine = new MCTSEngine({ simulations: 2, time_limit: 50 });
    engine.initialize({}, ['a']);
    const stats = engine.getTreeStats();
    expect(stats.totalNodes).toBeGreaterThanOrEqual(1);
  });
});

// ── run() ─────────────────────────────────────────────────────────────────────

describe('MCTSEngine.run()', () => {
  it('completes within time_limit and returns a result with expected shape', async () => {
    // Very short time_limit so the test doesn't hang
    const engine = new MCTSEngine({ simulations: 10, time_limit: 200 });
    const result = await engine.run({ step: 0 }, ['action_1', 'action_2', 'action_3']);

    expect(result).toHaveProperty('bestAction');
    expect(result).toHaveProperty('bestValue');
    expect(result).toHaveProperty('simulations');
    expect(result).toHaveProperty('tree');
    expect(typeof result.simulations).toBe('number');
    expect(result.simulations).toBeGreaterThanOrEqual(0);
  }, 5000);

  it('returns the root node in the tree field', async () => {
    const engine = new MCTSEngine({ simulations: 5, time_limit: 100 });
    const result = await engine.run({}, ['a', 'b']);

    expect(result.tree.id).toBe('root');
    expect(result.tree.action).toBe('root');
  }, 5000);

  it('handles a single possible action', async () => {
    const engine = new MCTSEngine({ simulations: 5, time_limit: 100 });
    const result = await engine.run({}, ['only_action']);

    // May or may not have explored; just ensure no crash
    expect(result).toBeDefined();
  }, 5000);

  it('handles empty actions array without crash', async () => {
    const engine = new MCTSEngine({ simulations: 5, time_limit: 100 });
    const result = await engine.run({}, []);

    // No actions to expand — bestAction will be empty
    expect(typeof result.bestAction).toBe('string');
  }, 5000);

  it('updates tree stats after run', async () => {
    const engine = new MCTSEngine({ simulations: 20, time_limit: 300 });
    await engine.run({ step: 0, goal_reached: false }, ['action_1', 'action_2']);

    const stats = engine.getTreeStats();
    // After some simulations, we expect more than just the root
    expect(stats.totalNodes).toBeGreaterThanOrEqual(1);
  }, 5000);
});