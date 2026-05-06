console.log('Starting import test...');
try {
    const { CuriosityEngine } = require('./lib/iqra/quran/curiosity');
    console.log('CuriosityEngine imported.');
    const { IQRAMemory } = require('./lib/iqra/memory');
    console.log('IQRAMemory imported.');
    process.exit(0);
} catch (e) {
    console.error('Import failed:', e);
    process.exit(1);
}
