import type { AnalysisResult, ResumeAnalysisResult } from '../features/job-analyzer/types';

const DB_NAME = 'AIVerifyMeHistory';
const DB_VERSION = 1;

export interface AgreementHistoryItem {
    id: number;
    filename: string;
    analyzedAt: string;
    result: AnalysisResult;
}

export interface ResumeHistoryItem {
    id: number;
    filename: string;
    analyzedAt: string;
    result: ResumeAnalysisResult;
}

/**
 * Repository for managing analysis history in IndexedDB
 */
export class AnalysisHistoryRepository {
    private db: IDBDatabase | null = null;

    private async initDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const database = (event.target as IDBOpenDBRequest).result;

                // Agreement analysis history
                if (!database.objectStoreNames.contains('agreements')) {
                    const agreementStore = database.createObjectStore('agreements', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    agreementStore.createIndex('analyzedAt', 'analyzedAt', { unique: false });
                }

                // Resume analysis history
                if (!database.objectStoreNames.contains('resumes')) {
                    const resumeStore = database.createObjectStore('resumes', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    resumeStore.createIndex('analyzedAt', 'analyzedAt', { unique: false });
                }
            };
        });
    }

    // Agreement History Methods
    async saveAgreementAnalysis(filename: string, result: AnalysisResult): Promise<number> {
        const database = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(['agreements'], 'readwrite');
            const store = transaction.objectStore('agreements');

            const item: Omit<AgreementHistoryItem, 'id'> = {
                filename,
                analyzedAt: new Date().toISOString(),
                result
            };

            const request = store.add(item);
            request.onsuccess = () => resolve(request.result as number);
            request.onerror = () => reject(request.error);
        });
    }

    async getAgreementHistory(): Promise<AgreementHistoryItem[]> {
        const database = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(['agreements'], 'readonly');
            const store = transaction.objectStore('agreements');
            const index = store.index('analyzedAt');
            const request = index.openCursor(null, 'prev'); // Newest first
            const items: AgreementHistoryItem[] = [];

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(items);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteAgreementAnalysis(id: number): Promise<void> {
        const database = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(['agreements'], 'readwrite');
            const store = transaction.objectStore('agreements');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearAgreementHistory(): Promise<void> {
        const database = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(['agreements'], 'readwrite');
            const store = transaction.objectStore('agreements');
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Resume History Methods
    async saveResumeAnalysis(filename: string, result: ResumeAnalysisResult): Promise<number> {
        const database = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(['resumes'], 'readwrite');
            const store = transaction.objectStore('resumes');

            const item: Omit<ResumeHistoryItem, 'id'> = {
                filename,
                analyzedAt: new Date().toISOString(),
                result
            };

            const request = store.add(item);
            request.onsuccess = () => resolve(request.result as number);
            request.onerror = () => reject(request.error);
        });
    }

    async getResumeHistory(): Promise<ResumeHistoryItem[]> {
        const database = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(['resumes'], 'readonly');
            const store = transaction.objectStore('resumes');
            const index = store.index('analyzedAt');
            const request = index.openCursor(null, 'prev'); // Newest first
            const items: ResumeHistoryItem[] = [];

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(items);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteResumeAnalysis(id: number): Promise<void> {
        const database = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(['resumes'], 'readwrite');
            const store = transaction.objectStore('resumes');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearResumeHistory(): Promise<void> {
        const database = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(['resumes'], 'readwrite');
            const store = transaction.objectStore('resumes');
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
