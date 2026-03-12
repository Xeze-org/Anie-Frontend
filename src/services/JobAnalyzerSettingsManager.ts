export interface JobAnalyzerSettings {
    apiKey: string;
    model: string;
    useOwnKey: boolean;
}

export const AVAILABLE_MODELS = [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Latest)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
];

/**
 * Singleton service for managing job analyzer settings
 */
export class JobAnalyzerSettingsManager {
    private static instance: JobAnalyzerSettingsManager;
    private readonly STORAGE_KEYS = {
        API_KEY: 'ea-scanner-api-key',
        MODEL: 'ea-scanner-model',
        USE_OWN_KEY: 'ea-scanner-use-own-key',
    } as const;

    private constructor() {}

    static getInstance(): JobAnalyzerSettingsManager {
        if (!JobAnalyzerSettingsManager.instance) {
            JobAnalyzerSettingsManager.instance = new JobAnalyzerSettingsManager();
        }
        return JobAnalyzerSettingsManager.instance;
    }

    loadSettings(): JobAnalyzerSettings {
        return {
            apiKey: localStorage.getItem(this.STORAGE_KEYS.API_KEY) || '',
            model: localStorage.getItem(this.STORAGE_KEYS.MODEL) || 'gemini-2.5-pro',
            useOwnKey: localStorage.getItem(this.STORAGE_KEYS.USE_OWN_KEY) === 'true',
        };
    }

    saveSettings(settings: JobAnalyzerSettings): void {
        localStorage.setItem(this.STORAGE_KEYS.API_KEY, settings.apiKey);
        localStorage.setItem(this.STORAGE_KEYS.MODEL, settings.model);
        localStorage.setItem(this.STORAGE_KEYS.USE_OWN_KEY, String(settings.useOwnKey));
    }

    clearSettings(): void {
        localStorage.removeItem(this.STORAGE_KEYS.API_KEY);
        localStorage.removeItem(this.STORAGE_KEYS.MODEL);
        localStorage.removeItem(this.STORAGE_KEYS.USE_OWN_KEY);
    }

    getAvailableModels() {
        return AVAILABLE_MODELS;
    }
}
