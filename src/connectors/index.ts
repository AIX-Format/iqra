import { BaseConnector } from './base';
import { GoogleConnector } from './google';
import { GroqConnector } from './groq';

export type Provider = 'google' | 'groq';

export class ConnectorFactory {
    static getConnector(provider?: Provider): BaseConnector {
        const target = provider || (process.env.DEFAULT_PROVIDER as Provider) || 'google';

        switch (target) {
            case 'google': return new GoogleConnector();
            case 'groq': return new GroqConnector();
            default: return new GoogleConnector();
        }
    }

    /**
     * Finds the first available connector with a valid API key.
     */
    static getFirstAvailable(): BaseConnector {
        if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return new GoogleConnector();
        if (process.env.GROQ_API_KEY) return new GroqConnector();
        
        throw new Error('No valid LLM API keys found (Google or Groq). Sovereignty requires real resonance.');
    }
}
