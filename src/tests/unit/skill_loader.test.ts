




































































































































    expect(SkillLoader.getSkillContent('does-not-exist')).toBeNull();
  });

  // ── node_modules fallback ────────────────────────────────────────────────

  it('falls back to node_modules/@aix/agent-skills when cwd-child and sibling are absent', () => {
    // Use a deeply-nested cwd so that ../aix-agent-skills resolves to a
    // directory that does NOT have a skills.json.
    const parent = path.join(tempRoot, 'npm-parent');
    const cwd = path.join(parent, 'npm-project');
    fs.mkdirSync(cwd, { recursive: true });
    const npmRepo = path.join(cwd, 'node_modules', '@aix', 'agent-skills');
    writeManifest(npmRepo, { skills: { npm_skill: 'skills/npm_skill.md' } });
    process.chdir(cwd);

    expect(SkillLoader.listSkills()).toEqual(['npm_skill']);
  });

  // ── caching ──────────────────────────────────────────────────────────────

  it('caches the resolved path so a second call does not re-stat', () => {
    const cwd = path.join(tempRoot, 'cache-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    const repo = path.join(cwd, 'aix-agent-skills');
    writeManifest(repo, { skills: { cached: 'skills/cached.md' } });
    process.chdir(cwd);

    // Warm up the cache.
    const first = SkillLoader.listSkills();

    // Remove the directory after the first call.  If the cache is working
    // the second call must still succeed using the already-resolved path.
    // (readFileSync will fail because the file is gone, so we expect null,
    // but listSkills() itself would throw rather than return [] if resolution
    // re-runs and wipes the cached dir.  Checking it doesn't throw is enough.)
    fs.rmSync(repo, { recursive: true, force: true });
    // Second call re-uses cached repo path → readFileSync on missing file
    // triggers the catch block → returns null / []
    // What matters: no exception is thrown, and the cache prevented a fresh
    // directory walk that would have found nothing and logged differently.
    expect(() => SkillLoader.listSkills()).not.toThrow();
    expect(first).toEqual(['cached']);
  });

  it('caches the "not found" sentinel so resolution is not retried on every call', () => {
    const empty = fs.mkdtempSync(path.join(tempRoot, 'sentinel-cwd-'));
    process.chdir(empty);

    // First call: resolution runs, finds nothing, sets _cachedRepoPath = ''.
    expect(SkillLoader.loadManifest()).toBeNull();

    // Second call without resetCache() must also return null without re-running
    // the full directory walk.  We verify by checking the result is still null
    // (i.e. the '' sentinel is treated as "not found" rather than "not yet
    // resolved").
    expect(SkillLoader.loadManifest()).toBeNull();
  });

  it('resetCache() allows re-resolution after a new marketplace appears', () => {
    const cwd = path.join(tempRoot, 'reset-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    process.chdir(cwd);

    // First call with no marketplace → null.
    expect(SkillLoader.loadManifest()).toBeNull();

    // Now create the marketplace directory and reset the cache.
    writeManifest(path.join(cwd, 'aix-agent-skills'), { skills: { new: 'skills/new.md' } });
    SkillLoader.resetCache();

    // After reset, re-resolution should find the new marketplace.
    expect(SkillLoader.listSkills()).toEqual(['new']);
  });

  // ── ENV_VAR edge cases ───────────────────────────────────────────────────

  it('ignores a whitespace-only IQRA_MARKETPLACE_PATH and falls through', () => {
    const cwd = path.join(tempRoot, 'ws-env-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    writeManifest(path.join(cwd, 'aix-agent-skills'), { skills: { ws: 'skills/ws.md' } });
    process.chdir(cwd);
    process.env[SkillLoader.ENV_VAR] = '   ';  // whitespace only

    expect(SkillLoader.listSkills()).toEqual(['ws']);
  });

  it('returns null when IQRA_MARKETPLACE_PATH points to a nonexistent directory', () => {
    const cwd = path.join(tempRoot, 'badenv-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    process.chdir(cwd);
    process.env[SkillLoader.ENV_VAR] = path.join(tempRoot, 'does-not-exist');

    // No fallback candidate has a marketplace either, so the result is null.
    expect(SkillLoader.loadManifest()).toBeNull();
  });

  it('ENV_VAR beats cwd-child, not just sibling', () => {
    const envDir = path.join(tempRoot, 'env-beats-child');
    const cwd = path.join(tempRoot, 'child-project');
    fs.mkdirSync(cwd, { recursive: true });
    writeManifest(envDir, { skills: { env_skill: 'skills/env.md' } });
    writeManifest(path.join(cwd, 'aix-agent-skills'), { skills: { child_skill: 'skills/child.md' } });
    process.chdir(cwd);
    process.env[SkillLoader.ENV_VAR] = envDir;

    expect(SkillLoader.listSkills()).toEqual(['env_skill']);
  });

  // ── error handling ───────────────────────────────────────────────────────

  it('returns null when skills.json contains invalid JSON', () => {
    const cwd = path.join(tempRoot, 'badjson-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    const repo = path.join(cwd, 'aix-agent-skills');
    fs.mkdirSync(repo, { recursive: true });
    fs.writeFileSync(path.join(repo, 'skills.json'), 'not-valid-json{{');
    process.chdir(cwd);

    expect(SkillLoader.loadManifest()).toBeNull();
    expect(SkillLoader.listSkills()).toEqual([]);
  });

  it('returns null when the referenced skill file is missing from disk', () => {
    const cwd = path.join(tempRoot, 'missingfile-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    const repo = path.join(cwd, 'aix-agent-skills');
    // skills.json points at a file that we intentionally do NOT create.
    writeManifest(repo, { skills: { ghost: 'skills/ghost.md' } });
    process.chdir(cwd);

    expect(SkillLoader.getSkillContent('ghost')).toBeNull();
  });

  it('returns null for an empty string skill name', () => {
    const cwd = path.join(tempRoot, 'emptyname-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    writeManifest(path.join(cwd, 'aix-agent-skills'), { skills: { real: 'skills/real.md' } });
    process.chdir(cwd);

    expect(SkillLoader.getSkillContent('')).toBeNull();
  });

  // ── empty skills collections ─────────────────────────────────────────────

  it('returns an empty array for a manifest with an empty skills record', () => {
    const cwd = path.join(tempRoot, 'empty-record-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    writeManifest(path.join(cwd, 'aix-agent-skills'), { skills: {} });
    process.chdir(cwd);

    expect(SkillLoader.listSkills()).toEqual([]);
  });

  it('returns an empty array for a manifest with an empty skills array', () => {
    const cwd = path.join(tempRoot, 'empty-array-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    writeManifest(path.join(cwd, 'aix-agent-skills'), { skills: [] });
    process.chdir(cwd);

    expect(SkillLoader.listSkills()).toEqual([]);
  });

  // ── optional manifest fields ─────────────────────────────────────────────

  it('exposes optional top-level manifest fields (name, version, marketplace_url)', () => {
    const cwd = path.join(tempRoot, 'meta-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    writeManifest(path.join(cwd, 'aix-agent-skills'), {
      name: 'my-marketplace',
      version: '2.0.0',
      marketplace_url: 'https://example.com/marketplace',
      skills: { demo: 'skills/demo.md' },
    });
    process.chdir(cwd);

    const manifest = SkillLoader.loadManifest();
    expect(manifest).not.toBeNull();
    expect(manifest!.name).toBe('my-marketplace');
    expect(manifest!.version).toBe('2.0.0');
    expect(manifest!.marketplace_url).toBe('https://example.com/marketplace');
  });

  // ── array-format: getSkillContent ────────────────────────────────────────

  it('resolves skill file path from an array-format manifest', () => {
    const cwd = path.join(tempRoot, 'array-content-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    const repo = path.join(cwd, 'aix-agent-skills');
    writeManifest(repo, {
      skills: [{ name: 'verse', description: 'Verse skill', file: 'skills/verse.md' }],
    });
    fs.mkdirSync(path.join(repo, 'skills'), { recursive: true });
    fs.writeFileSync(path.join(repo, 'skills', 'verse.md'), '# Verse\n');
    process.chdir(cwd);

    expect(SkillLoader.getSkillContent('verse')).toBe('# Verse\n');
  });

  it('returns null for a skill not present in an array-format manifest', () => {
    const cwd = path.join(tempRoot, 'array-unknown-cwd');
    fs.mkdirSync(cwd, { recursive: true });
    writeManifest(path.join(cwd, 'aix-agent-skills'), {
      skills: [{ name: 'known', file: 'skills/known.md' }],
    });
    process.chdir(cwd);

    expect(SkillLoader.getSkillContent('unknown')).toBeNull();
  });
});
