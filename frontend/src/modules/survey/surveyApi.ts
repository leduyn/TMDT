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

  getActiveQuestions: (context?: string, categoryId?: number) => {
    const params = new URLSearchParams();
    if (context) params.set('context', context);
    if (categoryId) params.set('categoryId', String(categoryId));
    const qs = params.toString();
    return fetchJSON<SurveyQuestionDTO[]>(`/api/survey/questions/active${qs ? `?${qs}` : ''}`);
  },

  submitAnswers: (agencyId: number, answers: { questionId: number; answer: string; categoryId?: number }[]) =>
    fetchJSON<void>(`/api/survey/agency/${agencyId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};

export interface SurveyQuestionDTO {
  id: number;
  question: string;
  type: string;
  options?: string;
  active: boolean;
  sortOrder: number;
  globalQuestion?: boolean;
  categoryIds?: number[];
  context?: string;
}
