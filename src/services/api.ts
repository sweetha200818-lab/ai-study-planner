import { Subject, Exam, StudySession } from '../types';

export interface PlanGenerationRequest {
  subjects: Subject[];
  exams: Exam[];
  dailyHours: number;
  startDate?: string;
  studyDaysCount?: number;
  learningStyle?: string;
  preferences?: string;
}

export interface PlanGenerationResponse {
  summary: string;
  keyHighlights: string[];
  sessions: StudySession[];
}

export interface RescheduleRequest {
  missedSessions: StudySession[];
  remainingSessions: StudySession[];
  subjects: Subject[];
  exams: Exam[];
  dailyHours: number;
  todayDate: string;
}

export interface RescheduleResponse {
  adjustmentStrategy: string;
  catchUpTips: string[];
  rescheduledSessions: StudySession[];
}

export interface QuizGenerationRequest {
  subjectName: string;
  topicName: string;
  difficulty?: string;
  questionCount?: number;
}

export interface TopicSuggestionRequest {
  subjectName: string;
  examType?: string;
  gradeLevel?: string;
}

export const apiService = {
  // 1. Generate full AI study timetable
  async generatePlan(params: PlanGenerationRequest): Promise<{ success: boolean; data?: PlanGenerationResponse; error?: string }> {
    try {
      const res = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate study timetable');
      }
      return { success: true, data: data.data };
    } catch (err: any) {
      console.error('API generatePlan error:', err);
      return { success: false, error: err.message || 'Server error' };
    }
  },

  // 2. Smart Reschedule when sessions are missed
  async rescheduleMissed(params: RescheduleRequest): Promise<{ success: boolean; data?: RescheduleResponse; error?: string }> {
    try {
      const res = await fetch('/api/plan/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reschedule study plan');
      }
      return { success: true, data: data.data };
    } catch (err: any) {
      console.error('API reschedule error:', err);
      return { success: false, error: err.message || 'Server error' };
    }
  },

  // 3. AI Quiz and Flashcard Generator
  async generateQuiz(params: QuizGenerationRequest): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate quiz');
      }
      return { success: true, data: data.data };
    } catch (err: any) {
      console.error('API generateQuiz error:', err);
      return { success: false, error: err.message || 'Server error' };
    }
  },

  // 4. Suggest Topics for a subject
  async suggestTopics(params: TopicSuggestionRequest): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/topics/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to suggest syllabus topics');
      }
      return { success: true, data: data.data };
    } catch (err: any) {
      console.error('API suggestTopics error:', err);
      return { success: false, error: err.message || 'Server error' };
    }
  },

  // 5. AI Study Coach chat
  async chatWithCoach(message: string, history: any[], studentContext: any): Promise<{ success: boolean; reply?: string; error?: string }> {
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, studentContext }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get coach response');
      }
      return { success: true, reply: data.reply };
    } catch (err: any) {
      console.error('API chatWithCoach error:', err);
      return { success: false, error: err.message || 'Server error' };
    }
  },
};
