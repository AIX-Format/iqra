import { Groq } from 'groq-sdk';
import { BaseConnector, ConnectorResponse } from './base';
import { IQRA_SYSTEM_PROMPT } from '../personality';

export class GroqConnector extends BaseConnector {
    name = 'Groq (Llama)';
    private client: Groq;

    constructor() {
        super();
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            this.handleFailure(new Error('Missing GROQ_API_KEY'), 'GROQ_INIT');
        }
        this.client = new Groq({
            apiKey,
        });
    }

    async generate(prompt: string, context: { role: 'user' | 'assistant' | 'system'; content: string }[] = []): Promise<ConnectorResponse> {
        try {
            // Find system prompt in context or use default
            let systemPrompt = context.find(m => m.role === 'system')?.content || IQRA_SYSTEM_PROMPT;
            const otherMessages = context.filter(m => m.role !== 'system');

            const response = await this.client.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...otherMessages as any,
                    { role: 'user', content: prompt }
                ],
                temperature: 0.2
            });

            const content = response.choices[0].message.content || '';
            
            // Verify output integrity
            await this.verifyTruth(content);

            return {
                content,
                model: 'llama-3.3-70b-versatile',
                usage: {
                    prompt_tokens: response.usage?.prompt_tokens || 0,
                    completion_tokens: response.usage?.completion_tokens || 0
                }
            };
        } catch (error: any) {
            this.handleFailure(error, 'GROQ_GENERATE');
        }
    }
}
