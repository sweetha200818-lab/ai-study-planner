export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'critical';
export type SessionType = 'deep_work' | 'revision' | 'practice_quiz' | 'flashcards' | 'mock_exam';
export type SessionStatus = 'pending' | 'completed' | 'missed' | 'skipped';
export type ExamPriority = 'high' | 'medium' | 'low';

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  chapterOrUnit?: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  masteryScore?: number; // 0 - 100
  keyConcepts?: string[];
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  color: string; // Tailwind color class or hex
  targetGrade?: string;
  difficulty: DifficultyLevel;
  examDate?: string;
  topics: Topic[];
  notes?: string;
  totalHoursNeeded?: number;
}

export interface Exam {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  date: string; // YYYY-MM-DD
  examDate?: string;
  time?: string; // e.g. 09:00 AM
  examTime?: string;
  targetScore?: string; // e.g. "95%" or "A+"
  priority?: ExamPriority;
  venueOrFormat?: string; // e.g. "Hall B - Written" or "Online CBT"
  weightPercent?: number;
  status?: string;
  notes?: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  title: string;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24-hour)
  durationMinutes: number;
  type: SessionType;
  status: SessionStatus;
  completedMinutes?: number;
  notes?: string;
  keyTakeaways?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  concept?: string;
  userSelectedOption?: number;
}

export interface Flashcard {
  id: string;
  topicId?: string;
  front: string;
  back: string;
  mastered?: boolean;
}

export interface Quiz {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  title: string;
  description?: string;
  questions: Question[];
  flashcards?: Flashcard[];
  difficulty?: string;
  score?: number;
  totalQuestions?: number;
  takenAt?: string;
  createdAt?: string;
}

export interface StudyReminder {
  id: string;
  title: string;
  message?: string;
  scheduledTime?: string;
  time?: string; // HH:mm
  days?: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  enabled: boolean;
  type: 'daily_briefing' | 'session_start' | 'exam_alert' | 'streak_keeper';
}

export type ReminderSetting = StudyReminder;

export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  subjectId: string;
  subjectName: string;
  topicName?: string;
  topicsCovered?: string[];
  notes?: string;
  type?: SessionType;
  timestamp?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  academicLevel: 'High School' | 'College / Undergraduate' | 'Graduate / Masters' | 'Medical / Law / Professional' | 'Self-Taught / Certifications' | string;
  gradeLevel?: string;
  dailyTargetHours: number; // e.g. 2.5
  preferredStudySlots?: ('Morning' | 'Afternoon' | 'Evening' | 'Night')[];
  learningStyle: 'Visual & Structured' | 'Active Recall & Practice Heavy' | 'Spaced Intervals & Deep Work' | 'Sprint & Review' | string;
  streakCount: number;
  currentStreak?: number;
  lastActiveDate: string;
  totalMinutesStudied: number;
  totalStudyMinutes?: number;
  xpPoints: number;
  xp?: number;
  level?: number;
}
