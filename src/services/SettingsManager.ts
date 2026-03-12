export interface AppSettings {
    useCustomApi: boolean;
    apiKey: string;
    model: string;
}

export const availableModels = [
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest (Recommended)' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
];

/**
 * Singleton service for managing application settings
 */
export class SettingsManager {
    private static instance: SettingsManager;
    private readonly STORAGE_KEY = 'anie-settings';
    private readonly defaultSettings: AppSettings = {
        useCustomApi: false,
        apiKey: '',
        model: 'gemini-2.5-flash'
    };

    private constructor() {}

    static getInstance(): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    getSettings(): AppSettings {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return { ...this.defaultSettings, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Error reading settings:', error);
        }
        return this.defaultSettings;
    }

    saveSettings(settings: AppSettings): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    clearSettings(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing settings:', error);
        }
    }

    getAvailableModels() {
        return availableModels;
    }
}
