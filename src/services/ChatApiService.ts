import { ApiService } from './ApiService';

export interface ChatHistoryMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatApiResponse {
    response?: string;
    message?: string;
    error?: string;
}

/**
 * Service for chat API interactions
 */
export class ChatApiService extends ApiService {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    async sendMessage(history: ChatHistoryMessage[]): Promise<string> {
        const data = await this.post<ChatApiResponse>('', { history });
        return data.response || data.message || JSON.stringify(data);
    }
}
