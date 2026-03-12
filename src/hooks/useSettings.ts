import { useState, useMemo } from 'react';
import { SettingsManager, type AppSettings } from '../services/SettingsManager';

/**
 * Hook for managing application settings using SettingsManager
 */
export function useSettings() {
    const manager = useMemo(() => SettingsManager.getInstance(), []);
    const [settings, setSettings] = useState<AppSettings>(manager.getSettings());

    const saveSettings = (newSettings: AppSettings) => {
        manager.saveSettings(newSettings);
        setSettings(newSettings);
    };

    const clearSettings = () => {
        manager.clearSettings();
        setSettings(manager.getSettings());
    };

    const availableModels = manager.getAvailableModels();

    return {
        settings,
        saveSettings,
        clearSettings,
        availableModels
    };
}
