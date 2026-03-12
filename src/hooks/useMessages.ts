import { useState, useEffect, useMemo } from 'react';
import { MessageRepository } from '../repositories/MessageRepository';
import type { ChatMessage } from '../lib/db';

/**
 * Hook for managing chat messages using MessageRepository
 */
export function useMessages() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const repository = useMemo(() => new MessageRepository(), []);

    useEffect(() => {
        const loadMessages = async () => {
            const loadedMessages = await repository.getAll();
            setMessages(loadedMessages);
            setIsLoading(false);
        };
        loadMessages();
    }, [repository]);

    const addMessage = async (message: ChatMessage) => {
        await repository.add(message);
        setMessages(prev => [...prev, message]);
    };

    const clearMessages = async () => {
        await repository.clear();
        setMessages([]);
    };

    const searchMessages = async (query: string) => {
        return repository.search(query);
    };

    return {
        messages,
        isLoading,
        addMessage,
        clearMessages,
        searchMessages
    };
}
