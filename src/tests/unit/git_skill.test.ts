/**
 * Unit Tests: GitSkill
 *
 * Tests the security validation (isSafeRefToken) and the public API
 * surface of GitSkill. The execSync calls are mocked so tests run
 * without a real git repository.
 *
 * Covers:
 *  - isSafeRefToken validation (exposed indirectly through createBranch / revertTo)
 *  - createBranch() — valid name succeeds, invalid names are rejected
 *  - revertTo() — safe ref succeeds, dangerous ref is rejected
 *  - head() / branch() / isClean() — happy and sad paths
 *  - recentCommits() — limit clamping to [1, 200]
 *  - commit() — empty paths / message guard
 *  - pushToBranch() — guards and flow
 *  - openPR() — empty title guard
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We mock child_process.execSync before importing GitSkill so the module
// picks up the mock at import time.
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

// Also mock IQRALogger to capture warnings without side effects.
vi.mock('#infra/logger', () => ({
  IQRALogger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { execSync } from 'child_process';
import { GitSkill } from '#skills/git_skill';
import { IQRALogger } from '#infra/logger';

const mockExec = execSync as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── head() ────────────────────────────────────────────────────────────────────

describe('GitSkill.head()', () => {
  it('returns the short SHA from git output', () => {
    mockExec.mockReturnValueOnce({ toString: () => 'abc1234\n' });
    expect(GitSkill.head()).toBe('abc1234');
  });

  it('returns empty string when execSync throws', () => {
    mockExec.mockImplementationOnce(() => { throw new Error('not a git repo'); });
    expect(GitSkill.head()).toBe('');
  });
});

// ── branch() ─────────────────────────────────────────────────────────────────

describe('GitSkill.branch()', () => {
  it('returns the branch name', () => {
    mockExec.mockReturnValueOnce({ toString: () => 'main\n' });
    expect(GitSkill.branch()).toBe('main');
  });

  it('returns empty string on detached HEAD', () => {
    mockExec.mockImplementationOnce(() => { throw new Error('HEAD detached'); });
    expect(GitSkill.branch()).toBe('');
  });
});

// ── isClean() ─────────────────────────────────────────────────────────────────

describe('GitSkill.isClean()', () => {
  it('returns true when porcelain output is empty', () => {
    mockExec.mockReturnValueOnce({ toString: () => '' });
    expect(GitSkill.isClean()).toBe(true);
  });

  it('returns false when there are uncommitted changes', () => {
    mockExec.mockReturnValueOnce({ toString: () => ' M src/index.ts\n' });
    expect(GitSkill.isClean()).toBe(false);
  });
});

// ── createBranch() ────────────────────────────────────────────────────────────

describe('GitSkill.createBranch() — ref validation', () => {
  it('returns true for a valid branch name', () => {
    mockExec.mockReturnValueOnce({ toString: () => "Switched to a new branch 'feature/test'\n" });
    const result = GitSkill.createBranch('feature/test');
    expect(result).toBe(true);
  });

  it('rejects a branch name starting with "-"', () => {
    const result = GitSkill.createBranch('-bad-branch');
    expect(result).toBe(false);
    expect(IQRALogger.warn).toHaveBeenCalledWith(expect.stringContaining('refusing invalid branch name'));
    expect(mockExec).not.toHaveBeenCalled();
  });

  it('rejects a branch name containing ".."', () => {
    const result = GitSkill.createBranch('refs..bad');
    expect(result).toBe(false);
    expect(mockExec).not.toHaveBeenCalled();
  });

  it('rejects a branch name containing "@{"', () => {
    const result = GitSkill.createBranch('branch@{yesterday}');
    expect(result).toBe(false);
    expect(mockExec).not.toHaveBeenCalled();
  });

  it('rejects a branch name with special shell characters', () => {
    // The regex only allows [A-Za-z0-9._/-]
    const result = GitSkill.createBranch('branch; rm -rf /');
    expect(result).toBe(false);
    expect(mockExec).not.toHaveBeenCalled();
  });

  it('rejects an empty branch name', () => {
    const result = GitSkill.createBranch('');
    expect(result).toBe(false);
  });

  it('accepts valid branch names with dots and slashes', () => {
    mockExec.mockReturnValueOnce({ toString: () => 'Switched\n' });
    const result = GitSkill.createBranch('fix/1.0.2-patch');
    expect(result).toBe(true);
  });
});

// ── revertTo() ────────────────────────────────────────────────────────────────

describe('GitSkill.revertTo() — ref validation', () => {
  it('returns true for a valid ref', () => {
    mockExec.mockReturnValueOnce({ toString: () => 'HEAD is now at abc1234\n' });
    expect(GitSkill.revertTo('abc1234')).toBe(true);
  });

  it('rejects a ref starting with "-" (flag injection guard)', () => {
    expect(GitSkill.revertTo('-f')).toBe(false);
    expect(IQRALogger.warn).toHaveBeenCalledWith(expect.stringContaining('refusing invalid ref'));
    expect(mockExec).not.toHaveBeenCalled();
  });

  it('rejects a ref containing ".."', () => {
    expect(GitSkill.revertTo('HEAD..main')).toBe(false);
    expect(mockExec).not.toHaveBeenCalled();
  });

  it('returns false when execSync throws on a valid ref', () => {
    mockExec.mockImplementationOnce(() => { throw new Error('not a git repo'); });
    expect(GitSkill.revertTo('abc1234')).toBe(false);
  });
});

// ── commit() ─────────────────────────────────────────────────────────────────

describe('GitSkill.commit()', () => {
  it('returns empty string for empty paths array', () => {
    expect(GitSkill.commit([], 'my message')).toBe('');
    expect(mockExec).not.toHaveBeenCalled();
  });

  it('returns empty string for empty message', () => {
    expect(GitSkill.commit(['src/index.ts'], '')).toBe('');
    expect(mockExec).not.toHaveBeenCalled();
  });

  it('calls git add and git commit and returns head SHA', () => {
    // git add -> no output; git commit -> no output; head -> sha
    mockExec
      .mockReturnValueOnce({ toString: () => '' })   // git add
      .mockReturnValueOnce({ toString: () => '' })   // git commit
      .mockReturnValueOnce({ toString: () => 'abc123\n' }); // git rev-parse --short HEAD

    const sha = GitSkill.commit(['src/file.ts'], 'feat: add feature');
    expect(sha).toBe('abc123');
    expect(mockExec).toHaveBeenCalledTimes(3);
  });

  it('escapes single quotes in paths', () => {
    mockExec.mockReturnValue({ toString: () => '' });
    GitSkill.commit(["path/with'quote.ts"], 'msg');
    // The add command should have escaped the quote
    const addCall = mockExec.mock.calls[0][0] as string;
    expect(addCall).toContain("'\\''");
  });
});

// ── recentCommits() ───────────────────────────────────────────────────────────

describe('GitSkill.recentCommits()', () => {
  it('returns an array of commit subjects', () => {
    mockExec.mockReturnValueOnce({ toString: () => 'feat: A\nfix: B\nchore: C\n' });
    const commits = GitSkill.recentCommits(3);
    expect(commits).toEqual(['feat: A', 'fix: B', 'chore: C']);
  });

  it('clamps limit to minimum of 1', () => {
    mockExec.mockReturnValueOnce({ toString: () => 'commit A\n' });
    GitSkill.recentCommits(0);
    const cmd = mockExec.mock.calls[0][0] as string;
    expect(cmd).toContain('-n 1');
  });

  it('clamps limit to maximum of 200', () => {
    mockExec.mockReturnValueOnce({ toString: () => 'commit A\n' });
    GitSkill.recentCommits(9999);
    const cmd = mockExec.mock.calls[0][0] as string;
    expect(cmd).toContain('-n 200');
  });

  it('returns empty array when git returns empty string', () => {
    mockExec.mockImplementationOnce(() => { throw new Error('no repo'); });
    const commits = GitSkill.recentCommits();
    expect(commits).toEqual([]);
  });
});

// ── pushToBranch() ────────────────────────────────────────────────────────────

describe('GitSkill.pushToBranch()', () => {
  it('returns false for invalid branch name', async () => {
    const result = await GitSkill.pushToBranch('-bad', 'message');
    expect(result).toBe(false);
    expect(IQRALogger.warn).toHaveBeenCalled();
  });

  it('returns false for empty message', async () => {
    const result = await GitSkill.pushToBranch('valid-branch', '');
    expect(result).toBe(false);
  });

  it('returns false when createBranch fails (git command errors)', async () => {
    // createBranch calls run() which returns '' on error -> returns false -> pushToBranch returns false
    mockExec.mockImplementationOnce(() => { throw new Error('branch exists'); });
    const result = await GitSkill.pushToBranch('existing-branch', 'msg');
    expect(result).toBe(false);
  });
});

// ── openPR() ─────────────────────────────────────────────────────────────────

describe('GitSkill.openPR()', () => {
  it('returns empty string when title is empty', async () => {
    const result = await GitSkill.openPR('', 'body');
    expect(result).toBe('');
    expect(mockExec).not.toHaveBeenCalled();
  });

  it('returns empty string when gh is not installed', async () => {
    // command -v gh -> ''
    mockExec.mockImplementationOnce(() => { throw new Error('gh not found'); });
    const result = await GitSkill.openPR('My PR', 'body text');
    expect(result).toBe('');
    expect(IQRALogger.warn).toHaveBeenCalledWith(expect.stringContaining('`gh` CLI not installed'));
  });

  it('returns PR URL when gh is available', async () => {
    mockExec
      .mockReturnValueOnce({ toString: () => '/usr/bin/gh\n' })   // command -v gh
      .mockReturnValueOnce({ toString: () => 'https://github.com/org/repo/pull/1\n' }); // gh pr create

    const result = await GitSkill.openPR('feat: new PR', 'description');
    expect(result).toBe('https://github.com/org/repo/pull/1');
  });

  it('escapes single quotes in title and body', async () => {
    mockExec
      .mockReturnValueOnce({ toString: () => '/usr/bin/gh\n' })
      .mockReturnValueOnce({ toString: () => 'https://github.com/org/repo/pull/2\n' });

    await GitSkill.openPR("it's a feature", "O'Brien's PR");
    const prCmd = mockExec.mock.calls[1][0] as string;
    expect(prCmd).toContain("'\\''");
  });
});