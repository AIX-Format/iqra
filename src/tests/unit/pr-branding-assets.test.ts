/**
 * Unit Tests: PR branding asset changes
 *
 * Covers changes introduced in this PR:
 *   - .iqra/cycle.txt        — cycle counter decremented from 15 → 14
 *   - package.json           — new "aix" metadata block added
 *   - assets/aix-footer-quote-v2.svg   — new SVG asset
 *   - assets/aix-stack-diagram-v2.svg  — new SVG asset
 *   - assets/aix-stack-header-v2.svg   — new SVG asset
 *   - assets/axi-mascot.svg            — new SVG asset
 *   - README.md              — structural / content updates
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..'); // src/tests/unit → root

// ── helpers ──────────────────────────────────────────────────────────────────
function readFile(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), 'utf8');
}

function readJson(relPath: string): unknown {
  return JSON.parse(readFile(relPath));
}

// ── .iqra/cycle.txt ───────────────────────────────────────────────────────────
describe('.iqra/cycle.txt', () => {
  const raw = readFile('.iqra/cycle.txt');

  it('contains exactly "14" as the cycle number', () => {
    expect(raw.trim()).toBe('14');
  });

  it('is a numeric string (no stray characters)', () => {
    expect(/^\d+$/.test(raw.trim())).toBe(true);
  });

  it('cycle number is less than 15 (decremented from previous value)', () => {
    expect(Number(raw.trim())).toBeLessThan(15);
  });

  it('cycle number is a positive integer', () => {
    const n = Number(raw.trim());
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThan(0);
  });
});

// ── package.json — aix metadata block ────────────────────────────────────────
describe('package.json aix metadata block', () => {
  const pkg = readJson('package.json') as Record<string, unknown>;
  const aix = pkg['aix'] as Record<string, string> | undefined;

  it('has an "aix" top-level field', () => {
    expect(aix).toBeDefined();
    expect(typeof aix).toBe('object');
    expect(aix).not.toBeNull();
  });

  it('aix.stackVersion is "0.369.0"', () => {
    expect(aix?.stackVersion).toBe('0.369.0');
  });

  it('aix.stackCodename is "Echo369"', () => {
    expect(aix?.stackCodename).toBe('Echo369');
  });

  it('aix.spec is "AIX/1.0"', () => {
    expect(aix?.spec).toBe('AIX/1.0');
  });

  it('aix.layer is "L2"', () => {
    expect(aix?.layer).toBe('L2');
  });

  it('aix.layerName is "runtime"', () => {
    expect(aix?.layerName).toBe('runtime');
  });

  it('aix.authority is "axiomid.app"', () => {
    expect(aix?.authority).toBe('axiomid.app');
  });

  it('package version is "0.3.69"', () => {
    expect(pkg['version']).toBe('0.3.69');
  });

  it('aix block has exactly 6 keys', () => {
    expect(Object.keys(aix ?? {})).toHaveLength(6);
  });

  it('all aix values are non-empty strings', () => {
    for (const [key, value] of Object.entries(aix ?? {})) {
      expect(typeof value, `aix.${key} should be a string`).toBe('string');
      expect((value as string).length, `aix.${key} should not be empty`).toBeGreaterThan(0);
    }
  });
});

// ── SVG helper assertions ─────────────────────────────────────────────────────
function assertValidSvgRoot(svg: string, label: string) {
  expect(svg, `${label}: must open with <svg`).toMatch(/<svg\b/);
  expect(svg, `${label}: must close with </svg>`).toMatch(/<\/svg>/);
  expect(svg, `${label}: must declare xmlns`).toContain('xmlns="http://www.w3.org/2000/svg"');
}

function getAttribute(svg: string, attr: string): string | null {
  const m = new RegExp(`<svg[^>]*\\s${attr}="([^"]*)"`, 's').exec(svg);
  return m ? m[1] : null;
}

// ── assets/aix-footer-quote-v2.svg ───────────────────────────────────────────
describe('assets/aix-footer-quote-v2.svg', () => {
  const svg = readFile('assets/aix-footer-quote-v2.svg');

  it('is a valid SVG document', () => {
    assertValidSvgRoot(svg, 'aix-footer-quote-v2.svg');
  });

  it('has width="900"', () => {
    expect(getAttribute(svg, 'width')).toBe('900');
  });

  it('has height="240"', () => {
    expect(getAttribute(svg, 'height')).toBe('240');
  });

  it('has viewBox="0 0 900 240"', () => {
    expect(getAttribute(svg, 'viewBox')).toBe('0 0 900 240');
  });

  it('contains the Echo369 stack comment', () => {
    expect(svg).toContain('AIX SOVEREIGN STACK');
    expect(svg).toContain('ECHO369');
  });

  it('contains the signature quote text', () => {
    expect(svg).toContain("King isn't Born, he is Made.");
  });

  it('contains the footer quote gradient id "footerAccentV2"', () => {
    expect(svg).toContain('id="footerAccentV2"');
  });

  it('contains the background pattern id "cfFooterV2"', () => {
    expect(svg).toContain('id="cfFooterV2"');
  });

  it('contains the neon green brand colour #39FF14', () => {
    expect(svg).toContain('#39FF14');
  });

  it('contains the layer stack labels L0 through L3', () => {
    expect(svg).toContain('L0');
    expect(svg).toContain('L1');
    expect(svg).toContain('L2');
    expect(svg).toContain('L3');
  });

  it('contains satellite layer labels', () => {
    expect(svg).toContain('alphaaxiom');
    expect(svg).toContain('piworker-os');
    expect(svg).toContain('gemclaw');
  });

  it('has a pulsing circle animation', () => {
    expect(svg).toContain('<animate');
    expect(svg).toContain('repeatCount="indefinite"');
  });

  it('contains the SPEC AIX/1.0 marker', () => {
    expect(svg).toContain('SPEC AIX/1.0');
  });

  // Regression: ensure previous footer file name is NOT referenced
  it('does not reference the old footer file name aix-footer-quote.svg', () => {
    expect(svg).not.toContain('aix-footer-quote.svg');
  });
});

// ── assets/aix-stack-diagram-v2.svg ──────────────────────────────────────────
describe('assets/aix-stack-diagram-v2.svg', () => {
  const svg = readFile('assets/aix-stack-diagram-v2.svg');

  it('is a valid SVG document', () => {
    assertValidSvgRoot(svg, 'aix-stack-diagram-v2.svg');
  });

  it('has width="1100"', () => {
    expect(getAttribute(svg, 'width')).toBe('1100');
  });

  it('has height="560"', () => {
    expect(getAttribute(svg, 'height')).toBe('560');
  });

  it('has viewBox="0 0 1100 560"', () => {
    expect(getAttribute(svg, 'viewBox')).toBe('0 0 1100 560');
  });

  it('contains the L0 ROOT AUTHORITY section', () => {
    expect(svg).toContain('ROOT AUTHORITY');
    expect(svg).toContain('L0');
    expect(svg).toContain('AXIOMID-PROJECT');
  });

  it('contains the L1 PROTOCOL section', () => {
    expect(svg).toContain('L1');
    expect(svg).toContain('PROTOCOL');
    expect(svg).toContain('AIX-FORMAT');
  });

  it('contains the L2 RUNTIME section', () => {
    expect(svg).toContain('L2');
    expect(svg).toContain('RUNTIME');
    expect(svg).toContain('IQRA');
  });

  it('contains the L3 MARKETPLACE section', () => {
    expect(svg).toContain('L3');
    expect(svg).toContain('MARKETPLACE');
    expect(svg).toContain('AGENT-SKILLS');
  });

  it('contains all three satellite layers L4/L5/L6', () => {
    expect(svg).toContain('L4');
    expect(svg).toContain('ALPHAAXIOM');
    expect(svg).toContain('L5');
    expect(svg).toContain('PIWORKER-OS');
    expect(svg).toContain('L6');
    expect(svg).toContain('GEMCLAW');
  });

  it('contains gold colour for L0 root authority (#FFD700)', () => {
    expect(svg).toContain('#FFD700');
  });

  it('contains neon green brand colour #39FF14 for sovereign core', () => {
    expect(svg).toContain('#39FF14');
  });

  it('contains the topological invariants legend', () => {
    expect(svg).toContain('TOPOLOGICAL INVARIANTS');
  });

  it('contains the Echo369 codename', () => {
    expect(svg).toContain('ECHO369');
  });

  it('contains the spec label AIX/1.0', () => {
    expect(svg).toContain('AIX/1.0');
  });

  it('contains filters for glow effects', () => {
    expect(svg).toContain('<filter');
    expect(svg).toContain('feGaussianBlur');
  });

  it('contains identity flow arrows between L0 and sovereign core', () => {
    expect(svg).toContain('identity flows down');
  });

  it('contains money flow markers for satellites buying skills', () => {
    expect(svg).toContain('buys skills');
  });

  // Regression: old diagram file name should not appear
  it('does not reference the old diagram file name aix-stack-diagram.svg', () => {
    expect(svg).not.toContain('"aix-stack-diagram.svg"');
  });
});

// ── assets/aix-stack-header-v2.svg ───────────────────────────────────────────
describe('assets/aix-stack-header-v2.svg', () => {
  const svg = readFile('assets/aix-stack-header-v2.svg');

  it('is a valid SVG document', () => {
    assertValidSvgRoot(svg, 'aix-stack-header-v2.svg');
  });

  it('has width="1100"', () => {
    expect(getAttribute(svg, 'width')).toBe('1100');
  });

  it('has height="340"', () => {
    expect(getAttribute(svg, 'height')).toBe('340');
  });

  it('has viewBox="0 0 1100 340"', () => {
    expect(getAttribute(svg, 'viewBox')).toBe('0 0 1100 340');
  });

  it('contains the THE AIX SOVEREIGN STACK header comment', () => {
    expect(svg).toContain('THE AIX SOVEREIGN STACK');
  });

  it('contains the Echo369 codename', () => {
    expect(svg).toContain('ECHO369');
  });

  it('contains L0 ROOT AUTHORITY section with AXIOMID-PROJECT', () => {
    expect(svg).toContain('ROOT AUTHORITY');
    expect(svg).toContain('AXIOMID-PROJECT');
  });

  it('contains sovereign core layers L1/L2/L3', () => {
    expect(svg).toContain('AIX-FORMAT');
    expect(svg).toContain('IQRA');
    expect(svg).toContain('AGENT-SKILLS');
  });

  it('contains satellite layers L4/L5/L6', () => {
    expect(svg).toContain('ALPHAAXIOM');
    expect(svg).toContain('PIWORKER-OS');
    expect(svg).toContain('GEMCLAW');
  });

  it('gold colour (#FFD700) used for L0 root authority', () => {
    expect(svg).toContain('#FFD700');
  });

  it('neon green (#39FF14) used for sovereign core layers', () => {
    expect(svg).toContain('#39FF14');
  });

  it('dimmed grey (#666666) used for satellite layers', () => {
    expect(svg).toContain('#666666');
  });

  it('contains a LIVE pulse animation', () => {
    expect(svg).toContain('LIVE');
    expect(svg).toContain('<animate');
    expect(svg).toContain('repeatCount="indefinite"');
  });

  it('contains the topAccentV2 gradient id', () => {
    expect(svg).toContain('id="topAccentV2"');
  });

  it('contains the pattern id "cfHeaderV2"', () => {
    expect(svg).toContain('id="cfHeaderV2"');
  });

  it('contains glow filter ids', () => {
    expect(svg).toContain('id="coreGlowV2"');
    expect(svg).toContain('id="rootGlow"');
  });

  it('contains M2M money flow markers', () => {
    expect(svg).toContain('M2M');
  });

  it('contains identity flow dashed lines from L0 to core', () => {
    expect(svg).toContain('stroke-dasharray');
  });

  // Regression: old header file name should not appear inside this SVG
  it('does not embed reference to old header file aix-stack-header.svg', () => {
    expect(svg).not.toContain('"aix-stack-header.svg"');
  });
});

// ── assets/axi-mascot.svg ────────────────────────────────────────────────────
describe('assets/axi-mascot.svg', () => {
  const svg = readFile('assets/axi-mascot.svg');

  it('is a valid SVG document', () => {
    assertValidSvgRoot(svg, 'axi-mascot.svg');
  });

  it('has width="200"', () => {
    expect(getAttribute(svg, 'width')).toBe('200');
  });

  it('has height="220"', () => {
    expect(getAttribute(svg, 'height')).toBe('220');
  });

  it('has viewBox="0 0 200 220"', () => {
    expect(getAttribute(svg, 'viewBox')).toBe('0 0 200 220');
  });

  it('has role="img" for accessibility', () => {
    expect(svg).toContain('role="img"');
  });

  it('has an aria-label attribute referencing the mascot', () => {
    expect(svg).toContain('aria-label="AXI Mascot');
  });

  it('contains a <title> element', () => {
    expect(svg).toMatch(/<title>/);
    expect(svg).toContain('AXI Mascot');
  });

  it('contains a <desc> element with branding description', () => {
    expect(svg).toMatch(/<desc>/);
    expect(svg).toContain('axiomid-project');
  });

  it('uses neon green #00ff41 as primary palette colour', () => {
    expect(svg).toContain('#00ff41');
  });

  it('uses cyan accent #00d4ff as secondary palette colour', () => {
    expect(svg).toContain('#00d4ff');
  });

  it('contains a body ellipse element', () => {
    expect(svg).toContain('<ellipse');
  });

  it('contains eye ellipses', () => {
    const eyeMatches = svg.match(/<ellipse[^>]*cx="78"[^>]*>/);
    expect(eyeMatches).not.toBeNull();
    const eyeMatches2 = svg.match(/<ellipse[^>]*cx="122"[^>]*>/);
    expect(eyeMatches2).not.toBeNull();
  });

  it('contains a smile path element', () => {
    expect(svg).toContain('<path');
    expect(svg).toContain('Q100 130');
  });

  it('contains gradient definitions', () => {
    expect(svg).toContain('<defs>');
    expect(svg).toContain('id="axiBodyGrad"');
    expect(svg).toContain('id="axiBodyFill"');
    expect(svg).toContain('id="axiGlow"');
  });

  it('gradient uses linearGradient from neon green to cyan', () => {
    expect(svg).toContain('<linearGradient id="axiBodyGrad"');
  });

  it('ambient glow halo is present', () => {
    // The outermost glow ellipse
    expect(svg).toContain('url(#axiGlow)');
  });

  it('body fill references axiBodyFill and axiBodyGrad', () => {
    expect(svg).toContain('url(#axiBodyFill)');
    expect(svg).toContain('url(#axiBodyGrad)');
  });

  // Boundary: ensure no script tags (XSS-safe SVG)
  it('contains no <script> elements (safe SVG)', () => {
    expect(svg).not.toMatch(/<script\b/i);
  });
});

// ── README.md content assertions ─────────────────────────────────────────────
describe('README.md structural updates', () => {
  const readme = readFile('README.md');

  it('references the new header SVG aix-stack-header-v2.svg', () => {
    expect(readme).toContain('aix-stack-header-v2.svg');
  });

  it('does not reference the old header SVG aix-stack-header.svg', () => {
    // Should have been replaced by the v2 asset
    expect(readme).not.toMatch(/["']\.\/assets\/aix-stack-header\.svg["']/);
  });

  it('references the new diagram SVG aix-stack-diagram-v2.svg', () => {
    expect(readme).toContain('aix-stack-diagram-v2.svg');
  });

  it('references the new footer SVG aix-footer-quote-v2.svg', () => {
    expect(readme).toContain('aix-footer-quote-v2.svg');
  });

  it('contains the AIX Stack badge (Echo369)', () => {
    expect(readme).toContain('Echo369');
  });

  it('contains the Spec badge AIX/1.0', () => {
    expect(readme).toContain('AIX%2F1.0');
  });

  it('contains the Layer badge (L2 RUNTIME)', () => {
    expect(readme).toContain('L2%20%C2%B7%20RUNTIME');
  });

  it('contains the version badge v0.3.69', () => {
    expect(readme).toContain('v0.3.69');
  });

  it('contains THE STACK section heading', () => {
    expect(readme).toContain('## 🌐 THE STACK');
  });

  it('contains the Sovereign Stack table with L1/L2/L3', () => {
    expect(readme).toContain('### Sovereign Stack (the three core repos)');
  });

  it('contains the Extended Ecosystem section', () => {
    expect(readme).toContain('### Extended Ecosystem (root authority + satellites)');
  });

  it('contains L0 axiomid-project in the extended ecosystem table', () => {
    expect(readme).toContain('axiomid-project');
    expect(readme).toContain('Root Authority');
  });

  it('contains satellite layers L4/L5/L6 in the table', () => {
    expect(readme).toContain('AlphaAxiom');
    expect(readme).toContain('PiWorker-OS');
    expect(readme).toContain('GemClaw');
  });

  it('contains navigation breadcrumbs: L1 · L2 · L3', () => {
    expect(readme).toContain('aix-format');
    expect(readme).toContain('YOU ARE HERE');
    expect(readme).toContain('aix-agent-skills');
  });

  it('contains L0 root authority link in the breadcrumb sub-line', () => {
    expect(readme).toContain('axiomid-project');
    expect(readme).toContain('L0');
  });

  it('does not contain the removed "Built by 1 Human + 7 AI Agents" section header', () => {
    expect(readme).not.toContain('## 🤝 Built by 1 Human + 7 AI Agents');
  });

  it('does not contain the removed coding-agent table rows (Codesmith, Jules, Cursor)', () => {
    // These were part of the removed section
    expect(readme).not.toContain('Codesmith');
    expect(readme).not.toContain('blacksmith.sh');
  });

  it('uses colons instead of em dashes in description prose', () => {
    // Spot-check one converted phrase
    expect(readme).toContain('engine level: not as an afterthought');
  });

  it('contains AXIOM.md reference for doctrine', () => {
    expect(readme).toContain('AXIOM.md');
  });
});
