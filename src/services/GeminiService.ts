import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatHistoryMessage {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * Service for interacting with Google Gemini AI
 */
export class GeminiService {
    private apiKey: string;
    private model: string;
    private systemInstructions: string;

    constructor(apiKey: string, model: string, systemInstructions: string) {
        this.apiKey = apiKey;
        this.model = model;
        this.systemInstructions = systemInstructions;
    }

    async sendMessage(history: ChatHistoryMessage[]): Promise<string> {
        if (!this.apiKey) {
            throw new Error('API key is required');
        }

        const genAI = new GoogleGenerativeAI(this.apiKey);
        const genModel = genAI.getGenerativeModel({
            model: this.model,
            systemInstruction: this.systemInstructions
        });

        // Start chat with history (excluding the last message which we'll send)
        const chat = genModel.startChat({
            history: history.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }))
        });

        // Send the last message
        const lastMessage = history[history.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;

        return response.text();
    }

    async testConnection(): Promise<boolean> {
        try {
            const genAI = new GoogleGenerativeAI(this.apiKey);
            const genModel = genAI.getGenerativeModel({ model: this.model });

            // Send a simple test message
            const result = await genModel.generateContent('Say "OK" if you can hear me.');
            await result.response;
            return true;
        } catch {
            return false;
        }
    }

    updateApiKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    updateModel(model: string): void {
        this.model = model;
    }
}
