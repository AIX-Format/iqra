import { execSync } from 'child_process';

/**
 * IQRA Pre-Flight Check: Git Integrity
 * "إِنَّ اللَّهَ يُحبُّ التَّوَّابِينَ وَيُحبُّ الْمُتَطَهِّرِينَ"
 * Ensures the working tree is clean before running E2E tests.
 */
export function verifyGitCleanliness() {
    console.log('🔍 [MURĀQABAH] | Checking Git working tree integrity...');
    try {
        const status = execSync('git status --porcelain').toString().trim();

        if (status) {
            console.error('❌ [ERROR] | Unstaged or uncommitted changes detected:');
            console.error('--------------------------------------------------');
            console.error(status);
            console.error('--------------------------------------------------');
            console.error('⚠️ Action Aborted: Please commit or stash your changes before running E2E.');
            console.error('Run: npx tsx lib/iqra/git-ops.ts (to trigger Sovereign Sync)');
            process.exit(1);
        }

        console.log('✅ [MURĀQABAH] | Working tree is clean. Proceeding to E2E...');
    } catch (error) {
        console.error('❌ [MURĀQABAH] | Critical failure during Git check:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    verifyGitCleanliness();
}