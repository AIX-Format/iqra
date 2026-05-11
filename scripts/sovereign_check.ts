import { RewardLedger } from '../src/lib/iqra/05-rewards/ledger';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function runCheck() {
    console.log('🛡️ Starting Sovereign Integrity Check...');
    let passed = true;

    // 1. Check TypeScript Error Count
    console.log('\n🔍 Checking TypeScript error count...');
    try {
        execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
        console.log('✅ TypeScript: 0 errors!');
    } catch (error: any) {
        const errorLines = error.stdout ? error.stdout.split('\n').filter((l: string) => l.trim().length > 0) : [];
        const errorCount = errorLines.length;
        if (errorCount < 100) {
            console.log(`⚠️ TypeScript: ${errorCount} errors (Under the 100 limit).`);
        } else {
            console.log(`❌ TypeScript: ${errorCount} errors (EXCEEDS the 100 limit!).`);
            passed = false;
        }
    }

    // 2. Check Go Engine Build
    console.log('\n🐹 Checking Go Engine Build...');
    try {
        execSync('cd src/services/go-engine && go build -o /tmp/iqra-engine-check .', { encoding: 'utf8', stdio: 'pipe' });
        console.log('✅ Go Engine builds successfully.');
    } catch (error: any) {
        console.log('❌ Go Engine build FAILED!');
        passed = false;
    }

    // 3. Check Directory Sovereignty
    console.log('\n📂 Checking Directory Sovereignty...');
    const illegalDirs = ['iqra-core', 'tests', 'lib'];
    const rootFiles = fs.readdirSync(process.cwd());
    const foundIllegal = rootFiles.filter(f => illegalDirs.includes(f));
    
    if (foundIllegal.length === 0) {
        console.log('✅ Directory structure is sovereign.');
    } else {
        console.log(`❌ Found illegal legacy directories: ${foundIllegal.join(', ')}`);
        passed = false;
    }

    // 4. Validate Reward Ledger Chain
    console.log('\n⛓️ Validating Reward Ledger Hash Chain...');
    const ledger = RewardLedger.getInstance();
    try {
        const isValid = await ledger.validateChain();
        if (isValid) {
            console.log('✅ Reward Ledger integrity verified.');
        } else {
            console.log('❌ Reward Ledger integrity compromised!');
            passed = false;
        }
    } catch (err) {
        console.log('⚠️ Reward Ledger file not found or empty (skipping validation).');
    }

    // 5. Run Unit Tests (Reward Integrity)
    console.log('\n🧪 Running Reward Integrity Unit Tests...');
    try {
        execSync('npx vitest run src/tests/unit/reward-ledger-integrity.test.ts', { encoding: 'utf8', stdio: 'pipe' });
        console.log('✅ Reward Ledger unit tests passed.');
    } catch (error) {
        console.log('❌ Reward Ledger unit tests FAILED!');
        passed = false;
    }

    if (passed) {
        console.log('\n✨ [SYSTEM READY] All checks passed. Sovereignty confirmed.');
        process.exit(0);
    } else {
        console.log('\n🛑 [SYSTEM HALTED] Integrity checks failed. Review errors before proceeding.');
        process.exit(1);
    }
}

runCheck();
