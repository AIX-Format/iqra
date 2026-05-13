/**
 * IQRA Browser Manager — مدير المتصفح
 * Implements Playwright reuse logic to save system resources.
 *
 * Playwright is loaded lazily so the package can be omitted from a slim
 * runtime (Edge, Vercel). Callers must `await getBrowserPage()` and check
 * for null when running in environments without playwright installed.
 */

let globalBrowser: any = null;
let playwrightMod: any = null;

async function loadPlaywright(): Promise<any> {
  if (playwrightMod) return playwrightMod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    playwrightMod = await import('playwright' as any);
    return playwrightMod;
  } catch {
    return null;
  }
}

export async function getBrowserPage(): Promise<any | null> {
  const pw = await loadPlaywright();
  if (!pw) {
    console.warn('⚠️ [BROWSER] playwright not installed; getBrowserPage() returning null.');
    return null;
  }
  if (!globalBrowser) {
    console.log('🚀 [أخوَّة] | Launching Shared Browser Instance...');
    globalBrowser = await pw.chromium.launch({ headless: true });
  }
  return await globalBrowser.newPage();
}

export async function closePage(page: any): Promise<void> {
  if (page) await page.close();
}

// Ensure browser closes on process exit
process.on('exit', () => {
  if (globalBrowser) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    globalBrowser.close();
  }
});
