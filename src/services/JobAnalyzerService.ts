import { ApiService } from './ApiService';
import type { AnalyzeRequest, AnalysisResult, ResumeAnalysisResult } from '../features/job-analyzer/types';

/**
 * Service for job document analysis
 */
export class JobAnalyzerService extends ApiService {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    async checkHealth(): Promise<boolean> {
        try {
            await this.get('/health', AbortSignal.timeout(15000));
            return true;
        } catch {
            return false;
        }
    }

    async analyzeDocument(request: AnalyzeRequest): Promise<AnalysisResult> {
        return this.post<AnalysisResult>('/api/analyze', request);
    }

    async analyzeResume(request: { api_key: string; document: string; filename: string }): Promise<ResumeAnalysisResult> {
        return this.post<ResumeAnalysisResult>('/api/resume/analyze', request);
    }

    fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data URL prefix (e.g., "data:application/pdf;base64,")
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
