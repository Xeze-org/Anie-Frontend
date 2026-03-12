import { db, type ChatMessage } from '../lib/db';

/**
 * Repository for managing chat messages in IndexedDB
 */
export class MessageRepository {
    async getAll(): Promise<ChatMessage[]> {
        try {
            const messages = await db.messages.orderBy('timestamp').toArray();
            return messages;
        } catch (error) {
            console.error('Error loading messages from IndexedDB:', error);
            return [];
        }
    }

    async add(message: ChatMessage): Promise<void> {
        try {
            await db.messages.add(message);
        } catch (error) {
            console.error('Error saving message to IndexedDB:', error);
        }
    }

    async clear(): Promise<void> {
        try {
            await db.messages.clear();
        } catch (error) {
            console.error('Error clearing messages from IndexedDB:', error);
        }
    }

    async count(): Promise<number> {
        try {
            return await db.messages.count();
        } catch (error) {
            console.error('Error counting messages:', error);
            return 0;
        }
    }

    async search(query: string): Promise<ChatMessage[]> {
        try {
            const allMessages = await db.messages.toArray();
            return allMessages.filter(msg =>
                msg.content.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error('Error searching messages:', error);
            return [];
        }
    }
}
