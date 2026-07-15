import { fetchJSON } from "@/lib/fetcher";

export interface SurveyAnswerDTO {
  id: number;
  questionId: number;
  question: string;
  questionType: string;
  answer: string;
  createdAt: string;
  categoryId?: number;
}

export interface SurveyAnswerStats {
  questionId: number;
  question: string;
  questionType: string;
  options: string;
  active: boolean;
  totalAnswers: number;
  optionCounts?: Record<string, number>;
  rawAnswers?: string[];
  globalQuestion?: boolean;
  categoryId?: number | null;
}

export const surveyApi = {
  getAgencyAnswers: (agencyId: number, categoryId?: number) =>
    fetchJSON<SurveyAnswerDTO[]>(`/api/survey/agency/${agencyId}/answers${categoryId !== undefined ? `?categoryId=${categoryId}` : ''}`),

  getAnswerStats: () =>
    fetchJSON<SurveyAnswerStats[]>('/api/survey/answers/stats'),
};
