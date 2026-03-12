/**
 * Base API Service for handling HTTP requests
 */
export class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    protected async get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            signal
        });

        if (!response.ok) {
            throw new Error(`GET ${endpoint} failed: ${response.status}`);
        }

        return response.json();
    }

    protected async post<T>(endpoint: string, data: unknown): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.details || error.error || `POST ${endpoint} failed`);
        }

        return response.json();
    }

    protected getBaseUrl(): string {
        return this.baseUrl;
    }
}
