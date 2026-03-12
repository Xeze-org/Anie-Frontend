import { useState, useEffect, useMemo } from 'react';
import { AnalysisHistoryRepository, type AgreementHistoryItem, type ResumeHistoryItem } from '../repositories/AnalysisHistoryRepository';
import type { AnalysisResult, ResumeAnalysisResult } from '../features/job-analyzer/types';

/**
 * Hook for managing analysis history
 */
export function useAnalysisHistory() {
    const repository = useMemo(() => new AnalysisHistoryRepository(), []);
    const [agreementHistory, setAgreementHistory] = useState<AgreementHistoryItem[]>([]);
    const [resumeHistory, setResumeHistory] = useState<ResumeHistoryItem[]>([]);

    const loadAgreementHistory = async () => {
        const history = await repository.getAgreementHistory();
        setAgreementHistory(history);
    };

    const loadResumeHistory = async () => {
        const history = await repository.getResumeHistory();
        setResumeHistory(history);
    };

    const saveAgreementAnalysis = async (filename: string, result: AnalysisResult) => {
        await repository.saveAgreementAnalysis(filename, result);
        await loadAgreementHistory();
    };

    const saveResumeAnalysis = async (filename: string, result: ResumeAnalysisResult) => {
        await repository.saveResumeAnalysis(filename, result);
        await loadResumeHistory();
    };

    const deleteAgreementAnalysis = async (id: number) => {
        await repository.deleteAgreementAnalysis(id);
        await loadAgreementHistory();
    };

    const deleteResumeAnalysis = async (id: number) => {
        await repository.deleteResumeAnalysis(id);
        await loadResumeHistory();
    };

    const clearAgreementHistory = async () => {
        await repository.clearAgreementHistory();
        setAgreementHistory([]);
    };

    const clearResumeHistory = async () => {
        await repository.clearResumeHistory();
        setResumeHistory([]);
    };

    return {
        agreementHistory,
        resumeHistory,
        loadAgreementHistory,
        loadResumeHistory,
        saveAgreementAnalysis,
        saveResumeAnalysis,
        deleteAgreementAnalysis,
        deleteResumeAnalysis,
        clearAgreementHistory,
        clearResumeHistory
    };
}
