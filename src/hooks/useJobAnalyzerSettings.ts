import { useState, useMemo } from 'react';
import { JobAnalyzerSettingsManager, type JobAnalyzerSettings } from '../services/JobAnalyzerSettingsManager';

/**
 * Hook for managing job analyzer settings
 */
export function useJobAnalyzerSettings() {
    const manager = useMemo(() => JobAnalyzerSettingsManager.getInstance(), []);
    const [settings, setSettings] = useState<JobAnalyzerSettings>(manager.loadSettings());

    const saveSettings = (newSettings: JobAnalyzerSettings) => {
        manager.saveSettings(newSettings);
        setSettings(newSettings);
    };

    const clearSettings = () => {
        manager.clearSettings();
        setSettings(manager.loadSettings());
    };

    const availableModels = manager.getAvailableModels();

    return {
        settings,
        saveSettings,
        clearSettings,
        availableModels
    };
}
