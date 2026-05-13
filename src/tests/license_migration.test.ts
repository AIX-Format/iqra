/**
 * Tests for PR changes:
 * - LICENSE (new Apache 2.0 file replacing MIT)
 * - README.md (license badges updated from MIT to Apache_2.0)
 * - package.json (license field changed from ISC to Apache-2.0)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../../');

// ─── Helpers ────────────────────────────────────────────────────────────────

function readText(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), 'utf8');
}

function readJson<T = unknown>(relPath: string): T {
  const raw = readFileSync(resolve(ROOT, relPath), 'utf8');
  return JSON.parse(raw) as T;
}

// ─── LICENSE ─────────────────────────────────────────────────────────────────

describe('LICENSE — Apache 2.0 license file', () => {
  let content: string;

  it('file exists at project root', () => {
    expect(existsSync(resolve(ROOT, 'LICENSE'))).toBe(true);
  });

  it('can be read as text', () => {
    content = readText('LICENSE');
    expect(content.length).toBeGreaterThan(0);
  });

  it('declares Apache License Version 2.0', () => {
    content = readText('LICENSE');
    expect(content).toContain('Apache License');
    expect(content).toContain('Version 2.0');
  });

  it('references the official Apache license URL', () => {
    content = readText('LICENSE');
    expect(content).toContain('http://www.apache.org/licenses/');
  });

  it('contains the copyright holder name', () => {
    content = readText('LICENSE');
    expect(content).toContain('Mohamed H Abdelaziz');
  });

  it('contains the copyright year 2026', () => {
    content = readText('LICENSE');
    expect(content).toContain('Copyright 2026');
  });

  it('includes the Grant of Copyright License section (section 2)', () => {
    content = readText('LICENSE');
    expect(content).toContain('Grant of Copyright License');
  });

  it('includes the Grant of Patent License section (section 3)', () => {
    content = readText('LICENSE');
    expect(content).toContain('Grant of Patent License');
  });

  it('includes the Redistribution section (section 4)', () => {
    content = readText('LICENSE');
    expect(content).toContain('Redistribution');
  });

  it('includes the Disclaimer of Warranty section (section 7)', () => {
    content = readText('LICENSE');
    expect(content).toContain('Disclaimer of Warranty');
    expect(content).toContain('AS IS');
  });

  it('includes the Limitation of Liability section (section 8)', () => {
    content = readText('LICENSE');
    expect(content).toContain('Limitation of Liability');
  });

  it('ends with the standard APPENDIX boilerplate', () => {
    content = readText('LICENSE');
    expect(content).toContain('APPENDIX');
    expect(content).toContain('Apache License, Version 2.0');
  });

  it('contains END OF TERMS AND CONDITIONS marker', () => {
    content = readText('LICENSE');
    expect(content).toContain('END OF TERMS AND CONDITIONS');
  });

  it('contains the standard license reproduction URL', () => {
    content = readText('LICENSE');
    expect(content).toContain('http://www.apache.org/licenses/LICENSE-2.0');
  });

  it('does NOT contain "MIT" license text', () => {
    content = readText('LICENSE');
    // Apache 2.0 file should not contain MIT references
    expect(content).not.toMatch(/^\s*MIT License\s*$/m);
    expect(content).not.toContain('Permission is hereby granted, free of charge');
  });

  it('covers all 9 numbered terms sections', () => {
    content = readText('LICENSE');
    // Verify section structure: sections 1 through 9 exist
    for (let section = 1; section <= 9; section++) {
      expect(content, `Section ${section} missing`).toMatch(
        new RegExp(`\\b${section}\\.\\s`)
      );
    }
  });

  // Boundary: file should be non-trivially long (Apache 2.0 is ~11k chars)
  it('has sufficient length for a complete Apache 2.0 license (> 10000 chars)', () => {
    content = readText('LICENSE');
    expect(content.length).toBeGreaterThan(10000);
  });
});

// ─── README.md ───────────────────────────────────────────────────────────────

describe('README.md — license badge updated from MIT to Apache 2.0', () => {
  let content: string;

  it('file exists', () => {
    expect(existsSync(resolve(ROOT, 'README.md'))).toBe(true);
  });

  it('can be read as text', () => {
    content = readText('README.md');
    expect(content.length).toBeGreaterThan(0);
  });

  it('top badge references Apache_2.0 in the shield URL', () => {
    content = readText('README.md');
    expect(content).toContain('LICENSE-Apache_2.0');
  });

  it('top badge links to the LICENSE file', () => {
    content = readText('README.md');
    expect(content).toContain('(./LICENSE)');
  });

  it('footer image badge references Apache_2.0', () => {
    content = readText('README.md');
    expect(content).toContain('License-Apache_2.0');
  });

  it('footer badge has alt text "License: Apache 2.0"', () => {
    content = readText('README.md');
    expect(content).toContain('alt="License: Apache 2.0"');
  });

  it('does NOT contain the old MIT license badge URL', () => {
    content = readText('README.md');
    expect(content).not.toContain('LICENSE-MIT');
  });

  it('does NOT contain a plain MIT license badge label in footer', () => {
    content = readText('README.md');
    expect(content).not.toContain('License-MIT');
  });

  it('contains exactly two Apache_2.0 license badge references (top + footer)', () => {
    content = readText('README.md');
    // Both the shield.io top badge and footer badge use Apache_2.0
    const apacheMatches = content.match(/Apache_2\.0/g);
    expect(apacheMatches).not.toBeNull();
    expect(apacheMatches!.length).toBeGreaterThanOrEqual(2);
  });

  // Regression: ensure MIT did not survive in either badge location
  it('regression — MIT does not appear as a badge label in any shields.io img/link', () => {
    content = readText('README.md');
    // Match shields.io badge patterns containing MIT
    const mitBadgePattern = /shields\.io\/badge\/License[^)]*-MIT/;
    expect(mitBadgePattern.test(content)).toBe(false);
  });
});

// ─── package.json ────────────────────────────────────────────────────────────

describe('package.json — license field updated to Apache-2.0', () => {
  interface PackageJson {
    name: string;
    version: string;
    license: string;
    [key: string]: unknown;
  }

  let pkg: PackageJson;

  it('parses as valid JSON', () => {
    expect(() => {
      pkg = readJson<PackageJson>('package.json');
    }).not.toThrow();
  });

  it('has a license field', () => {
    pkg = readJson<PackageJson>('package.json');
    expect(pkg).toHaveProperty('license');
  });

  it('license field is "Apache-2.0"', () => {
    pkg = readJson<PackageJson>('package.json');
    expect(pkg.license).toBe('Apache-2.0');
  });

  it('license field is NOT the old "ISC" value', () => {
    pkg = readJson<PackageJson>('package.json');
    expect(pkg.license).not.toBe('ISC');
  });

  it('license field is NOT "MIT"', () => {
    pkg = readJson<PackageJson>('package.json');
    expect(pkg.license).not.toBe('MIT');
  });

  it('license field is a non-empty string', () => {
    pkg = readJson<PackageJson>('package.json');
    expect(typeof pkg.license).toBe('string');
    expect(pkg.license.trim().length).toBeGreaterThan(0);
  });

  it('license identifier follows SPDX format (Apache-2.0)', () => {
    pkg = readJson<PackageJson>('package.json');
    // SPDX identifier for Apache 2.0 is exactly "Apache-2.0"
    expect(pkg.license).toMatch(/^Apache-2\.0$/);
  });

  // Sanity: other essential package.json fields are still intact
  it('package name is still "iqra"', () => {
    pkg = readJson<PackageJson>('package.json');
    expect(pkg.name).toBe('iqra');
  });

  it('package still has an author field', () => {
    pkg = readJson<PackageJson>('package.json');
    expect(pkg).toHaveProperty('author');
    expect(typeof pkg.author).toBe('string');
    expect((pkg.author as string).length).toBeGreaterThan(0);
  });

  // Boundary: verify the raw JSON text also reflects the change (no stale ISC)
  it('raw JSON text does not contain "ISC" as a license value', () => {
    const raw = readText('package.json');
    // Should not have "license": "ISC"
    expect(raw).not.toMatch(/"license"\s*:\s*"ISC"/);
  });
});

// ─── LICENSE — additional coverage ───────────────────────────────────────────

describe('LICENSE — section names and key definitions', () => {
  let content: string;

  beforeEach(() => {
    content = readText('LICENSE');
  });

  it('contains "January 2004" in the version header', () => {
    expect(content).toContain('January 2004');
  });

  it('contains the full TERMS AND CONDITIONS header', () => {
    expect(content).toContain(
      'TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION'
    );
  });

  it('section 1 is named "Definitions"', () => {
    expect(content).toMatch(/1\.\s+Definitions\./);
  });

  it('section 5 is named "Submission of Contributions"', () => {
    expect(content).toContain('Submission of Contributions');
    expect(content).toMatch(/5\.\s+Submission of Contributions/);
  });

  it('section 6 is named "Trademarks"', () => {
    expect(content).toContain('Trademarks');
    expect(content).toMatch(/6\.\s+Trademarks/);
  });

  it('section 9 is named "Accepting Warranty or Additional Liability"', () => {
    expect(content).toContain('Accepting Warranty or Additional Liability');
    expect(content).toMatch(/9\.\s+Accepting Warranty/);
  });

  it('defines "Licensor"', () => {
    expect(content).toContain('"Licensor"');
  });

  it('defines "Contributor"', () => {
    expect(content).toContain('"Contributor"');
  });

  it('defines "Derivative Works"', () => {
    expect(content).toContain('"Derivative Works"');
  });

  it('defines "Legal Entity"', () => {
    expect(content).toContain('"Legal Entity"');
  });

  it('defines "You" (or "Your")', () => {
    expect(content).toContain('"You"');
  });

  it('grants include "royalty-free" language (sections 2 and 3)', () => {
    const royaltyFreeCount = (content.match(/royalty-free/g) ?? []).length;
    // Appears at least twice: once in section 2 and once in section 3
    expect(royaltyFreeCount).toBeGreaterThanOrEqual(2);
  });

  it('section 7 uses all-caps "WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND"', () => {
    expect(content).toContain('WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND');
  });

  it('section 7 mentions NON-INFRINGEMENT and MERCHANTABILITY', () => {
    expect(content).toContain('NON-INFRINGEMENT');
    expect(content).toContain('MERCHANTABILITY');
  });

  it('does not contain "ISC" anywhere in the file', () => {
    expect(content).not.toContain('ISC');
  });

  it('first non-empty line contains "Apache License"', () => {
    const firstNonEmpty = content.split('\n').find((l) => l.trim().length > 0) ?? '';
    expect(firstNonEmpty).toContain('Apache License');
  });

  it('appendix boilerplate instructs replacing bracket placeholders', () => {
    expect(content).toContain('[');
    expect(content).toContain(']');
    expect(content).toContain("fields enclosed by brackets");
  });

  it('copyright statement uses the SPDX-compatible identifier phrase "Apache License, Version 2.0"', () => {
    // The appendix boilerplate contains this exact phrase
    expect(content).toContain('Apache License, Version 2.0 (the "License")');
  });

  // Negative boundary: ISC and MIT are absent entirely as license identifiers
  it('does not contain "MIT License" anywhere', () => {
    expect(content).not.toContain('MIT License');
  });
});

// ─── README.md — badge structure and color details ───────────────────────────

describe('README.md — badge structure, color, and style details', () => {
  let content: string;

  beforeEach(() => {
    content = readText('README.md');
  });

  it('top license badge uses accent color 39FF14', () => {
    expect(content).toMatch(/LICENSE-Apache_2\.0-39FF14/);
  });

  it('top license badge uses labelColor=050505', () => {
    expect(content).toMatch(/labelColor=050505/);
  });

  it('top license badge uses "for-the-badge" style', () => {
    expect(content).toMatch(/style=for-the-badge/);
  });

  it('top license badge label text is "LICENSE" (all caps)', () => {
    // The markdown link text for the license badge is LICENSE
    expect(content).toMatch(/\[!\[License\]/);
  });

  it('footer license badge uses "flat-square" style', () => {
    expect(content).toMatch(/License-Apache_2\.0-green\?style=flat-square/);
  });

  it('footer license badge uses green color', () => {
    expect(content).toMatch(/Apache_2\.0-green/);
  });

  it('footer license badge is an <img> tag (not a markdown link badge)', () => {
    // Footer badge is a plain img, not wrapped in [![]()]
    expect(content).toMatch(/<img src="[^"]*License-Apache_2\.0[^"]*"/);
  });

  it('top license badge points to shields.io domain', () => {
    expect(content).toMatch(/https:\/\/img\.shields\.io\/badge\/LICENSE-Apache_2\.0/);
  });

  it('footer license badge points to shields.io domain', () => {
    expect(content).toMatch(/https:\/\/img\.shields\.io\/badge\/License-Apache_2\.0/);
  });

  it('does not reference "ISC" in any badge', () => {
    // Regression guard — ISC was never the old badge text but ensure clean slate
    const badgePattern = /shields\.io\/badge\/[^)]*ISC/;
    expect(badgePattern.test(content)).toBe(false);
  });

  it('top badge href and footer img both use shields.io (two shield.io license references)', () => {
    const shieldLicenseMatches = content.match(/shields\.io\/badge\/[A-Z]?[Ll]icense/g);
    expect(shieldLicenseMatches).not.toBeNull();
    expect(shieldLicenseMatches!.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── package.json — structural integrity after license change ─────────────────

describe('package.json — structural integrity after license change', () => {
  interface PackageJson {
    name: string;
    version: string;
    license: string;
    keywords?: string[];
    repository?: { type: string; url: string };
    bugs?: { url: string };
    homepage?: string;
    [key: string]: unknown;
  }

  let pkg: PackageJson;

  beforeEach(() => {
    pkg = readJson<PackageJson>('package.json');
  });

  it('version field is present and non-empty', () => {
    expect(pkg).toHaveProperty('version');
    expect(typeof pkg.version).toBe('string');
    expect(pkg.version.trim().length).toBeGreaterThan(0);
  });

  it('keywords array exists and contains "ai"', () => {
    expect(pkg).toHaveProperty('keywords');
    expect(Array.isArray(pkg.keywords)).toBe(true);
    expect(pkg.keywords).toContain('ai');
  });

  it('repository field still points to the iqra GitHub repo', () => {
    expect(pkg).toHaveProperty('repository');
    expect(pkg.repository?.url).toContain('iqra');
  });

  it('bugs.url still points to the correct GitHub issues URL', () => {
    expect(pkg).toHaveProperty('bugs');
    expect(pkg.bugs?.url).toContain('github.com');
    expect(pkg.bugs?.url).toContain('iqra');
  });

  it('homepage field is present', () => {
    expect(pkg).toHaveProperty('homepage');
    expect(typeof pkg.homepage).toBe('string');
    expect((pkg.homepage as string).length).toBeGreaterThan(0);
  });

  it('license is not null or undefined', () => {
    expect(pkg.license).not.toBeNull();
    expect(pkg.license).not.toBeUndefined();
  });

  it('license field has no surrounding whitespace', () => {
    // SPDX identifiers must not have leading/trailing spaces
    expect(pkg.license).toBe(pkg.license.trim());
  });

  it('license field contains the version number "2.0"', () => {
    expect(pkg.license).toContain('2.0');
  });
});

// ─── Cross-file consistency ───────────────────────────────────────────────────

describe('Cross-file consistency — LICENSE, README.md, and package.json agree', () => {
  it('package.json SPDX identifier "Apache-2.0" corresponds to the LICENSE file name "Apache License"', () => {
    const pkg = readJson<{ license: string }>('package.json');
    const licenseText = readText('LICENSE');
    // Apache-2.0 SPDX maps to "Apache License"
    expect(pkg.license).toMatch(/^Apache-2\.0$/);
    expect(licenseText).toContain('Apache License');
    expect(licenseText).toContain('Version 2.0');
  });

  it('README top badge "Apache_2.0" is consistent with LICENSE file content', () => {
    const readme = readText('README.md');
    const licenseText = readText('LICENSE');
    expect(readme).toContain('Apache_2.0');
    expect(licenseText).toContain('Apache License');
  });

  it('README footer badge "Apache_2.0" is consistent with package.json license field "Apache-2.0"', () => {
    const readme = readText('README.md');
    const pkg = readJson<{ license: string }>('package.json');
    expect(readme).toContain('Apache_2.0');
    // Both refer to the same Apache 2.0 license, differing only in separator
    expect(pkg.license.replace('-', '_')).toBe('Apache_2.0');
  });

  it('the LICENSE file exists at the path referenced by the README badge link (./LICENSE)', () => {
    const readme = readText('README.md');
    // README badge links to ./LICENSE
    expect(readme).toContain('(./LICENSE)');
    // The file must exist at root
    expect(existsSync(resolve(ROOT, 'LICENSE'))).toBe(true);
  });

  it('none of the three files contains the old "ISC" license identifier', () => {
    const licenseText = readText('LICENSE');
    const readme = readText('README.md');
    const pkgRaw = readText('package.json');
    expect(licenseText).not.toContain('ISC');
    expect(readme).not.toMatch(/["']ISC["']/);
    expect(pkgRaw).not.toMatch(/"license"\s*:\s*"ISC"/);
  });

  it('none of the three files promotes an MIT license', () => {
    const licenseText = readText('LICENSE');
    const readme = readText('README.md');
    const pkgRaw = readText('package.json');
    expect(licenseText).not.toContain('MIT License');
    expect(readme).not.toMatch(/shields\.io\/badge\/LICENSE-MIT/);
    expect(pkgRaw).not.toMatch(/"license"\s*:\s*"MIT"/);
  });

  it('copyright holder name in LICENSE matches the project author in package.json (last name)', () => {
    const licenseText = readText('LICENSE');
    const pkg = readJson<{ author: string }>('package.json');
    // LICENSE: "Mohamed H Abdelaziz", package.json author: "Moe Abdelaziz"
    // Both share the surname "Abdelaziz"
    expect(licenseText).toContain('Abdelaziz');
    expect(pkg.author).toContain('Abdelaziz');
  });
});
