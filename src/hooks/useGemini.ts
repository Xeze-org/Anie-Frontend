import { useMemo } from 'react';
import { GeminiService, type ChatHistoryMessage } from '../services/GeminiService';
import { SYSTEM_INSTRUCTIONS } from '../constants/geminiInstructions';

/**
 * Hook for interacting with Gemini AI
 */
export function useGemini(apiKey: string, model: string) {
    const service = useMemo(
        () => new GeminiService(apiKey, model, SYSTEM_INSTRUCTIONS),
        [apiKey, model]
    );

    const sendMessage = async (history: ChatHistoryMessage[]): Promise<string> => {
        return service.sendMessage(history);
    };

    const testConnection = async (): Promise<boolean> => {
        return service.testConnection();
    };

    return {
        sendMessage,
        testConnection
    };
}
