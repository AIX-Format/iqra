import { IQRAMemory } from '../lib/iqra/memory';
import { IQRALogger } from '../lib/iqra/logger';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    IQRALogger.info("🔍 Testing Connections...");
    
    try {
        IQRALogger.info("Testing Redis...");
        await IQRAMemory.set('test_key', 'test_value');
        const val = await IQRAMemory.get('test_key');
        IQRALogger.info(`Redis Success: ${val}`);

        IQRALogger.info("Testing Google Embeddings...");
        const embedding = await IQRAMemory.getEmbedding("Bismillah");
        IQRALogger.info(`Embeddings Success: Vector length ${embedding.length}`);

        process.exit(0);
    } catch (e: any) {
        IQRALogger.error(`❌ Connection Test Failed: ${e.message}`);
        process.exit(1);
    }
}

test();
