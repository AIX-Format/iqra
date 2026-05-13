/**
 * Unit Tests: browser_manager
 *
 * Tests the lazy-loading refactor introduced in this PR:
 *   - getBrowserPage() returns null when playwright is not installed
 *   - getBrowserPage() creates a browser on first call when playwright is available
 *   - closePage() closes the page when page is truthy, is a no-op for null/undefined
 *
 * Since playwright is not installed in this environment, we mock dynamic
 * imports to simulate both the "installed" and "not-installed" paths.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to reset module state between tests since browser_manager uses
// module-level variables (globalBrowser, playwrightMod).

describe('browser_manager — lazy playwright loading', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('getBrowserPage() returns null when playwright is not installed', async () => {
    // Simulate playwright import failure
    vi.doMock('playwright', () => {
      throw new Error('Cannot find module playwright');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { getBrowserPage } = await import('#utils/browser_manager');
    const page = await getBrowserPage();

    expect(page).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('playwright not installed'),
    );

    consoleSpy.mockRestore();
  });

  it('closePage() is a no-op when page is null', async () => {
    vi.doMock('playwright', () => {
      throw new Error('not installed');
    });

    const { closePage } = await import('#utils/browser_manager');

    // Should not throw
    await expect(closePage(null)).resolves.toBeUndefined();
  });

  it('closePage() calls page.close() when page is defined', async () => {
    vi.doMock('playwright', () => {
      throw new Error('not installed');
    });

    const { closePage } = await import('#utils/browser_manager');

    const mockPage = { close: vi.fn().mockResolvedValue(undefined) };
    await closePage(mockPage);

    expect(mockPage.close).toHaveBeenCalledOnce();
  });

  it('getBrowserPage() launches browser on first call when playwright is available', async () => {
    const mockPage = { close: vi.fn() };
    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn(),
    };
    const mockChromium = {
      launch: vi.fn().mockResolvedValue(mockBrowser),
    };

    vi.doMock('playwright', () => ({
      chromium: mockChromium,
    }));

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { getBrowserPage } = await import('#utils/browser_manager');
    const page = await getBrowserPage();

    expect(page).toBe(mockPage);
    expect(mockChromium.launch).toHaveBeenCalledWith({ headless: true });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Launching Shared Browser'));

    consoleSpy.mockRestore();
  });

  it('getBrowserPage() reuses existing browser on second call', async () => {
    const mockPage = { close: vi.fn() };
    let launchCount = 0;
    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn(),
    };
    const mockChromium = {
      launch: vi.fn().mockImplementation(() => {
        launchCount++;
        return Promise.resolve(mockBrowser);
      }),
    };

    vi.doMock('playwright', () => ({
      chromium: mockChromium,
    }));

    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { getBrowserPage } = await import('#utils/browser_manager');

    await getBrowserPage();
    await getBrowserPage();

    // Should only launch once (browser is reused)
    expect(launchCount).toBe(1);
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(2);
  });
});