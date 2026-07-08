import { fetchJSON } from "@/lib/fetcher";

export interface SurveyAnswerDTO {
  id: number;
  questionId: number;
  question: string;
  questionType: string;
  answer: string;
  createdAt: string;
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
}

export const surveyApi = {
  getAgencyAnswers: (agencyId: number) =>
    fetchJSON<SurveyAnswerDTO[]>(`/api/survey/agency/${agencyId}/answers`),

  getAnswerStats: () =>
    fetchJSON<SurveyAnswerStats[]>('/api/survey/answers/stats'),
};
