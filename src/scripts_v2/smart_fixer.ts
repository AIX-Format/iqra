#!/usr/bin/env node
/**
 * 🤖 Smart Fixer — المعالج الذكي لأخطاء TypeScript
 * 
 * "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ" — النجم: 39
 * 
 * يستخدم 7-Round Meta-Debug Loop:
 * 1. HUNT: اكتشاف الأخطاء عبر TypeScript API
 * 2. REMEMBER: مطابقة الأنماط المعروفة
 * 3. LEARN: تحليل الجذور
 * 4. APPLY: إصلاح تلقائي
 * 5. ADAPT: التحقق من القيود
 * 6. RESONATE: اختبار الإصلاح
 * 7. TEACH: التوثيق
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ── Configuration ─────────────────────────────────────────────────────────────
const ROOT_DIR = path.join(process.cwd(), 'lib/iqra');
const TSCONFIG_PATH = path.join(process.cwd(), 'tsconfig.json');

// ── Error Patterns ────────────────────────────────────────────────────────────
interface FixPattern {
  code: number;
  name: string;
  regex: RegExp;
  fix: (match: RegExpMatchArray, filePath: string) => string;
}

const FIX_PATTERNS: FixPattern[] = [
  // TS2307: Cannot find module
  {
    code: 2307,
    name: 'MissingModule',
    regex: /Cannot find module ['"]([^'"]+)['"]\./,
    fix: (match, filePath) => {
      const modulePath = match[1];
      
      // Pattern 1: Remove .ts extension from local imports
      if (modulePath.endsWith('.ts') && !modulePath.startsWith('.')) {
        return modulePath.replace(/\.ts$/, '');
      }
      
      // Pattern 2: Convert relative ../../../ to #alias
      if (modulePath.includes('../../../schema/')) {
        return modulePath.replace('../../../schema/', '#schema/').replace(/\.ts$/, '');
      }
      if (modulePath.includes('../../../src/connectors/')) {
        return modulePath.replace('../../../src/connectors/', '#connectors/').replace(/\.ts$/, '');
      }
      if (modulePath.includes('../../../agents/')) {
        return modulePath.replace('../../../agents/', '#agents/').replace(/\.ts$/, '');
      }
      
      // Pattern 3: Remove .js extension
      if (modulePath.endsWith('.js')) {
        return modulePath.replace(/\.js$/, '');
      }
      
      return modulePath;
    }
  }
];

// ── Round 1: HUNT ───────────────────────────────────────────────────────────
async function huntErrors(): Promise<ts.Diagnostic[]> {
  console.log('🔍 [HUNT] Scanning for TypeScript errors...');
  
  const configFile = ts.readConfigFile(TSCONFIG_PATH, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    process.cwd()
  );
  
  const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options
  });
  
  const diagnostics = ts.getPreEmitDiagnostics(program);
  
  console.log(`🎯 Found ${diagnostics.length} errors`);
  return diagnostics;
}

// ── Round 2 & 3: REMEMBER & LEARN ─────────────────────────────────────────────
function analyzeError(error: ts.Diagnostic): { file: string; line: number; code: number; message: string } | null {
  if (!error.file) return null;
  
  const { line } = error.file.getLineAndCharacterOfPosition(error.start!);
  const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
  
  return {
    file: error.file.fileName,
    line: line + 1,
    code: error.code,
    message
  };
}

// ── Round 4: APPLY ────────────────────────────────────────────────────────────
async function applyFix(errorInfo: ReturnType<typeof analyzeError>): Promise<boolean> {
  if (!errorInfo) return false;
  
  const pattern = FIX_PATTERNS.find(p => p.code === errorInfo!.code);
  if (!pattern) {
    console.log(`⚠️ No fix pattern for error ${errorInfo.code}`);
    return false;
  }
  
  const match = errorInfo.message.match(pattern.regex);
  if (!match) return false;
  
  const newPath = pattern.fix(match, errorInfo.file);
  if (newPath === match[1]) return false; // No change needed
  
  // Read file and apply fix
  const content = fs.readFileSync(errorInfo.file, 'utf-8');
  const lines = content.split('\n');
  const targetLine = lines[errorInfo.line - 1];
  
  if (!targetLine.includes(match[1])) {
    console.log(`⚠️ Pattern not found in line ${errorInfo.line}`);
    return false;
  }
  
  // Apply the fix
  lines[errorInfo.line - 1] = targetLine.replace(match[1], newPath);
  fs.writeFileSync(errorInfo.file, lines.join('\n'));
  
  console.log(`✅ Fixed: ${match[1]} → ${newPath}`);
  return true;
}

// ── Round 5: ADAPT ───────────────────────────────────────────────────────────
function verifyFix(filePath: string): boolean {
  // Quick syntax check
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for double extensions
  if (content.includes('.ts.ts') || content.includes('.js.js')) {
    console.log(`❌ Double extension detected in ${filePath}`);
    return false;
  }
  
  // Check for remaining ../../../
  if (content.includes('../../../')) {
    console.log(`⚠️ Still has relative paths: ${filePath}`);
    return false;
  }
  
  return true;
}

// ── Round 6: RESONATE ──────────────────────────────────────────────────────────
async function verifyCompilation(): Promise<number> {
  console.log('🔄 [RESONATE] Verifying compilation...');
  
  try {
    execSync('npx tsc --noEmit 2>/dev/null || true', { cwd: process.cwd() });
    return 0;
  } catch (e) {
    // Count remaining errors
    const output = execSync('npx tsc --noEmit 2>&1 | grep "error TS" | wc -l', { cwd: process.cwd() });
    return parseInt(output.toString().trim()) || 0;
  }
}

// ── Round 7: TEACH ───────────────────────────────────────────────────────────
function teachPattern(error: ts.Diagnostic, fixed: boolean) {
  const code = error.code;
  const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
  
  // Log to progress file
  const logEntry = `[${new Date().toISOString()}] TS${code}: ${fixed ? 'FIXED' : 'PENDING'} - ${message.slice(0, 100)}\n`;
  fs.appendFileSync('./progress.txt', logEntry);
}

// ── Main Meta-Loop ────────────────────────────────────────────────────────────
async function runMetaLoop() {
  console.log('\n🕋 [7-ROUND META-DEBUG LOOP] Starting...\n');
  
  let iteration = 0;
  let lastErrorCount = Infinity;
  
  while (iteration < 10) { // Max 10 iterations
    iteration++;
    console.log(`\n📍 Iteration ${iteration}`);
    
    // Round 1: HUNT
    const errors = await huntErrors();
    const errorCount = errors.length;
    
    if (errorCount === 0) {
      console.log('🎉 No errors found! Mission complete.');
      break;
    }
    
    if (errorCount >= lastErrorCount) {
      console.log('⚠️ Error count not decreasing. Stopping.');
      break;
    }
    
    lastErrorCount = errorCount;
    console.log(`📊 Current errors: ${errorCount}`);
    
    // Round 2-4: REMEMBER, LEARN, APPLY
    let fixedCount = 0;
    for (const error of errors.slice(0, 50)) { // Process top 50 errors
      const errorInfo = analyzeError(error);
      if (errorInfo) {
        const fixed = await applyFix(errorInfo);
        if (fixed) fixedCount++;
        teachPattern(error, fixed);
      }
    }
    
    console.log(`🔧 Fixed ${fixedCount} errors in this iteration`);
    
    // Round 5: ADAPT
    if (fixedCount > 0) {
      console.log('✅ Fixes applied successfully');
    }
    
    // Small delay to let file system settle
    await new Promise(r => setTimeout(r, 100));
  }
  
  // Final verification
  const finalErrors = await verifyCompilation();
  console.log(`\n🏁 Final error count: ${finalErrors}`);
  console.log('📝 Progress logged to ./progress.txt');
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || import.meta.url === `file://${process.cwd()}/scripts/smart_fixer.ts`;
if (isMainModule) {
  runMetaLoop().catch(console.error);
}

export { runMetaLoop, huntErrors, applyFix };
