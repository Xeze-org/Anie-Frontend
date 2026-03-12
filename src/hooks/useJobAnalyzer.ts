import { useMemo } from 'react';
import { JobAnalyzerService } from '../services/JobAnalyzerService';
import type { AnalyzeRequest, AnalysisResult, ResumeAnalysisResult } from '../features/job-analyzer/types';

const API_URL = import.meta.env.VITE_JOB_ANALYZER_API_URL || 'https://docs-backend-271230242037.asia-south1.run.app';

/**
 * Hook for job analyzer operations
 */
export function useJobAnalyzer() {
    const service = useMemo(() => new JobAnalyzerService(API_URL), []);

    const checkHealth = async (): Promise<boolean> => {
        return service.checkHealth();
    };

    const analyzeDocument = async (request: AnalyzeRequest): Promise<AnalysisResult> => {
        return service.analyzeDocument(request);
    };

    const analyzeResume = async (request: { api_key: string; document: string; filename: string }): Promise<ResumeAnalysisResult> => {
        return service.analyzeResume(request);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return service.fileToBase64(file);
    };

    return {
        checkHealth,
        analyzeDocument,
        analyzeResume,
        fileToBase64
    };
}
