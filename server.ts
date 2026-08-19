import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy / Safe Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Using intelligent fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 1. AI Study Timetable Generation Endpoint
app.post("/api/plan/generate", async (req: Request, res: Response) => {
  try {
    const { subjects, exams, dailyHours, startDate, studyDaysCount, learningStyle, preferences } = req.body;

    const prompt = `
You are an expert academic planner and learning scientist.
Create a realistic, highly effective, day-by-day study schedule for a student.

Input Data:
- Start Date: ${startDate || new Date().toISOString().split("T")[0]}
- Total Days to Schedule: ${studyDaysCount || 14} days
- Daily Available Study Time: ${dailyHours || 2.5} hours (${(dailyHours || 2.5) * 60} minutes)
- Learning Style / Preference: ${learningStyle || "Balanced with active recall and revision"}
- Student Special Notes: ${preferences || "Focus heavily on upcoming exam dates and high-difficulty topics"}

Subjects & Topics:
${JSON.stringify(subjects, null, 2)}

Upcoming Exams & Deadlines:
${JSON.stringify(exams, null, 2)}

Instructions for the Schedule:
1. Distribute topics fairly across the days, giving more time to hard/critical topics and subjects with earlier exam dates.
2. Incorporate spaced repetition and active recall: mix revision sessions, practice quizzes, and deep study blocks.
3. Reserve the 1-2 days right before any exam for comprehensive revision and mock review, not brand new complex topics.
4. Keep daily total study time close to the available daily hours (${dailyHours || 2.5}h).
5. Provide actionable notes for each session so the student knows exactly what to study.

Return a valid JSON object matching the schema.
`;

    const ai = getAIClient();
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "Executive summary of the study strategy and timeline",
              },
              keyHighlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 bullet points describing key milestones or advice",
              },
              sessions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    subjectId: { type: Type.STRING },
                    subjectName: { type: Type.STRING },
                    topicId: { type: Type.STRING },
                    topicName: { type: Type.STRING },
                    scheduledDate: { type: Type.STRING, description: "YYYY-MM-DD" },
                    startTime: { type: Type.STRING, description: "e.g. 16:00 or 19:00" },
                    durationMinutes: { type: Type.INTEGER, description: "Session length in minutes, e.g. 45 or 60" },
                    type: {
                      type: Type.STRING,
                      description: "One of: deep_work, revision, practice_quiz, flashcards, mock_exam",
                    },
                    title: { type: Type.STRING },
                    notes: { type: Type.STRING, description: "Specific study instructions or key formulas to review" },
                  },
                  required: ["subjectName", "scheduledDate", "durationMinutes", "type", "title"],
                },
              },
            },
            required: ["summary", "sessions"],
          },
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({ success: true, data: parsed });
    } else {
      // Intelligent fallback generator if API key is missing
      const fallbackSchedule = generateFallbackSchedule(subjects, exams, dailyHours, startDate, studyDaysCount);
      return res.json({ success: true, data: fallbackSchedule, fallback: true });
    }
  } catch (error: any) {
    console.error("Plan generation error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI study plan",
    });
  }
});

// 2. AI Smart Rescheduler Endpoint (Missed Sessions / Catch Up)
app.post("/api/plan/reschedule", async (req: Request, res: Response) => {
  try {
    const { missedSessions, remainingSessions, subjects, exams, dailyHours, todayDate } = req.body;

    const prompt = `
You are an adaptive AI academic assistant.
The student has missed ${missedSessions?.length || 0} scheduled study session(s) or fallen behind.
Rebalance and reschedule their remaining workload so they stay on track for their exams without burning out.

Today's Date: ${todayDate || new Date().toISOString().split("T")[0]}
Available Daily Hours: ${dailyHours || 2.5} hours
Missed Sessions to Re-integrate:
${JSON.stringify(missedSessions, null, 2)}

Remaining Scheduled Sessions:
${JSON.stringify(remainingSessions, null, 2)}

Exams / Deadlines:
${JSON.stringify(exams, null, 2)}

Instructions:
1. Re-prioritize pending critical topics from missed sessions.
2. Smoothly spread the missed workload over the next available days.
3. If necessary, slightly condense low-priority revision or suggest 15-minute quick flashcard reviews so daily load stays realistic.
4. Output the updated session list starting from ${todayDate}.

Return JSON conforming to the schema.
`;

    const ai = getAIClient();
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              adjustmentStrategy: {
                type: Type.STRING,
                description: "Explanation of how the schedule was adjusted and what changed",
              },
              catchUpTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 motivational tips for catching up effectively",
              },
              rescheduledSessions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    subjectId: { type: Type.STRING },
                    subjectName: { type: Type.STRING },
                    topicId: { type: Type.STRING },
                    topicName: { type: Type.STRING },
                    scheduledDate: { type: Type.STRING, description: "YYYY-MM-DD" },
                    startTime: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ["subjectName", "scheduledDate", "durationMinutes", "type", "title"],
                },
              },
            },
            required: ["adjustmentStrategy", "rescheduledSessions"],
          },
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({ success: true, data: parsed });
    } else {
      // Fallback adjustment
      const fallbackReschedule = generateFallbackReschedule(missedSessions, remainingSessions, todayDate);
      return res.json({ success: true, data: fallbackReschedule, fallback: true });
    }
  } catch (error: any) {
    console.error("Reschedule error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to reschedule sessions",
    });
  }
});

// 3. AI Quiz & Flashcard Generator Endpoint
app.post("/api/quiz/generate", async (req: Request, res: Response) => {
  try {
    const { subjectName, topicName, difficulty, questionCount = 5 } = req.body;

    const prompt = `
Generate an engaging, high-yield practice quiz and flashcards for a student studying:
Subject: ${subjectName || "General Science"}
Topic / Chapter: ${topicName || "Key Fundamentals"}
Target Difficulty: ${difficulty || "Medium"}
Number of Questions: ${questionCount}

Instructions:
1. Provide ${questionCount} multiple choice questions (with 4 options each).
2. Clearly mark the correct option index (0 to 3).
3. Provide a clear, educational explanation for why the answer is correct and why other options are common traps.
4. Also generate 4 concise flashcards (front concept/question and back definition/answer) for rapid spaced-repetition memory review.
`;

    const ai = getAIClient();
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctOptionIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    concept: { type: Type.STRING },
                  },
                  required: ["text", "options", "correctOptionIndex", "explanation"],
                },
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                  },
                  required: ["front", "back"],
                },
              },
            },
            required: ["title", "questions", "flashcards"],
          },
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({ success: true, data: parsed });
    } else {
      const fallbackQuiz = generateFallbackQuiz(subjectName, topicName);
      return res.json({ success: true, data: fallbackQuiz, fallback: true });
    }
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate quiz",
    });
  }
});

// 4. AI Syllabus & Topic Breakdown Auto-Suggester
app.post("/api/topics/suggest", async (req: Request, res: Response) => {
  try {
    const { subjectName, examType, gradeLevel } = req.body;

    const prompt = `
You are a curriculum specialist. Break down the following academic course into 5-8 structured, sequential topics/chapters with estimated study hours and difficulty levels:
Subject: ${subjectName}
Exam/Course Type: ${examType || "General Academic Course"}
Level: ${gradeLevel || "Undergraduate / High School"}

For each topic, provide:
- Topic/Chapter Name
- Key concepts covered (3-4 keywords)
- Difficulty (easy, medium, hard, critical)
- Estimated study time in hours
- Recommended study order (1 to N)
`;

    const ai = getAIClient();
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING },
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    chapterOrUnit: { type: Type.STRING },
                    difficulty: { type: Type.STRING, description: "easy, medium, hard, or critical" },
                    estimatedMinutes: { type: Type.INTEGER },
                    keyConcepts: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    notes: { type: Type.STRING },
                  },
                  required: ["name", "difficulty", "estimatedMinutes"],
                },
              },
            },
            required: ["overview", "topics"],
          },
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({ success: true, data: parsed });
    } else {
      const fallback = generateFallbackTopics(subjectName);
      return res.json({ success: true, data: fallback, fallback: true });
    }
  } catch (error: any) {
    console.error("Topic suggest error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to suggest topics",
    });
  }
});

// 5. AI Study Coach & Tutor Chat
app.post("/api/assistant/chat", async (req: Request, res: Response) => {
  try {
    const { message, history, studentContext } = req.body;

    const systemInstruction = `
You are "Aura", an encouraging, highly knowledgeable AI Study Coach and Academic Mentor.
You help students with:
- Study strategies (Pomodoro, Feynman technique, Active Recall, Leitner system)
- Breaking down difficult topics into simple analogies
- Overcoming procrastination and exam anxiety
- Time management and balancing multiple heavy subjects

Current Student Context:
${JSON.stringify(studentContext || {}, null, 2)}

Keep responses direct, encouraging, well-formatted with markdown and actionable study steps.
`;

    const ai = getAIClient();
    if (process.env.GEMINI_API_KEY) {
      const formattedContents = [];
      if (history && Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          formattedContents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.content }],
          });
        }
      }
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ success: true, reply: response.text });
    } else {
      return res.json({
        success: true,
        reply: `Great question about studying! Here is a proven strategy: 
1. **Active Recall**: Test yourself every 20 minutes instead of passive re-reading.
2. **Pomodoro Technique**: 25 min deep work, 5 min break.
3. **Interleaving**: Alternate between two distinct subjects to strengthen brain consolidation.
Keep going, you're making steady progress toward your exams!`,
      });
    }
  } catch (error: any) {
    console.error("Coach chat error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate coaching response",
    });
  }
});

// Helper Fallback Functions for resilience
function generateFallbackSchedule(subjects: any[], exams: any[], dailyHours: number = 2.5, startDate: string, daysCount: number = 14) {
  const sessions: any[] = [];
  const baseDate = new Date(startDate || Date.now());
  const allTopics: { subject: any; topic: any }[] = [];

  (subjects || []).forEach((sub) => {
    (sub.topics || []).forEach((top: any) => {
      allTopics.push({ subject: sub, topic: top });
    });
  });

  if (allTopics.length === 0) {
    allTopics.push(
      { subject: { id: "s1", name: "Mathematics" }, topic: { id: "t1", name: "Calculus & Derivatives", estimatedMinutes: 60 } },
      { subject: { id: "s2", name: "Physics" }, topic: { id: "t2", name: "Electromagnetism & Waves", estimatedMinutes: 60 } },
      { subject: { id: "s3", name: "Computer Science" }, topic: { id: "t3", name: "Algorithms & Complexity", estimatedMinutes: 60 } }
    );
  }

  let topicIndex = 0;
  for (let d = 0; d < daysCount; d++) {
    const curDate = new Date(baseDate);
    curDate.setDate(curDate.getDate() + d);
    const dateStr = curDate.toISOString().split("T")[0];

    // Check if there is an exam within 2 days
    const upcomingExam = (exams || []).find((e: any) => {
      const eDate = new Date(e.date);
      const diff = Math.ceil((eDate.getTime() - curDate.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 2;
    });

    if (upcomingExam && d > 0) {
      sessions.push({
        id: `sess-${d}-1`,
        subjectId: upcomingExam.subjectId || "sub-1",
        subjectName: upcomingExam.title || "Exam Subject",
        topicId: "top-rev",
        topicName: `Comprehensive Exam Review: ${upcomingExam.title}`,
        scheduledDate: dateStr,
        startTime: "16:00",
        durationMinutes: Math.min(120, Math.round(dailyHours * 60)),
        type: "revision",
        title: `High-Yield Mock Review: ${upcomingExam.title}`,
        notes: "Work through practice problem sets, review formula sheet, and clarify weak spots.",
      });
    } else {
      const item = allTopics[topicIndex % allTopics.length];
      topicIndex++;

      const sessionType = d % 3 === 0 ? "deep_work" : d % 3 === 1 ? "practice_quiz" : "revision";
      sessions.push({
        id: `sess-${d}-1`,
        subjectId: item.subject.id,
        subjectName: item.subject.name,
        topicId: item.topic.id,
        topicName: item.topic.name,
        scheduledDate: dateStr,
        startTime: "16:30",
        durationMinutes: 60,
        type: sessionType,
        title: `${sessionType === "deep_work" ? "Deep Study" : sessionType === "practice_quiz" ? "Active Quiz" : "Concept Review"}: ${item.topic.name}`,
        notes: `Focus on mastering key formulas and core principles for ${item.topic.name}.`,
      });

      // Second session if time allows
      if (dailyHours >= 2 && allTopics.length > 1) {
        const item2 = allTopics[topicIndex % allTopics.length];
        topicIndex++;
        sessions.push({
          id: `sess-${d}-2`,
          subjectId: item2.subject.id,
          subjectName: item2.subject.name,
          topicId: item2.topic.id,
          topicName: item2.topic.name,
          scheduledDate: dateStr,
          startTime: "18:00",
          durationMinutes: 45,
          type: "flashcards",
          title: `Flashcards & Summary: ${item2.topic.name}`,
          notes: `Rapid active recall testing on key terminology.`,
        });
      }
    }
  }

  return {
    summary: `Structured ${daysCount}-day high-yield study plan targeting all subjects with spaced repetition and pre-exam consolidation.`,
    keyHighlights: [
      `Evenly distributes study time across ${subjects?.length || 3} subjects`,
      "Integrated active recall quizzes every 2-3 days",
      "Dedicated pre-exam review periods to maximize score retention",
    ],
    sessions,
  };
}

function generateFallbackReschedule(missed: any[], remaining: any[], todayDate: string) {
  const adjusted = [...(remaining || [])];
  const today = new Date(todayDate || Date.now());

  (missed || []).forEach((m, idx) => {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + (idx % 3) + 1);
    adjusted.push({
      ...m,
      id: `re-sess-${Date.now()}-${idx}`,
      scheduledDate: targetDate.toISOString().split("T")[0],
      startTime: "19:30",
      status: "pending",
      title: `[Catch-Up] ${m.title || m.topicName}`,
      notes: `Rescheduled from missed session. Focus on core high-priority concepts.`,
    });
  });

  return {
    adjustmentStrategy: `Re-allocated ${missed?.length || 0} missed study block(s) smoothly across upcoming open slots with optimized 30-45 minute focus sprints.`,
    catchUpTips: [
      "Prioritize understanding key fundamentals over re-reading everything",
      "Use 25-minute Pomodoro sprints to quickly eliminate backlog without fatigue",
    ],
    rescheduledSessions: adjusted,
  };
}

function generateFallbackQuiz(subjectName: string = "Mathematics", topicName: string = "Derivatives") {
  return {
    title: `${subjectName}: ${topicName} Practice Assessment`,
    description: `Targeted diagnostic quiz covering core fundamentals and application problems.`,
    questions: [
      {
        id: "q1",
        text: `What is the derivative of f(x) = x^3 - 4x + 7 with respect to x?`,
        options: ["3x^2 - 4", "3x^2 + 7", "x^2 - 4", "3x - 4"],
        correctOptionIndex: 0,
        explanation: "By the power rule, d/dx(x^n) = n*x^(n-1). Thus d/dx(x^3) = 3x^2, d/dx(-4x) = -4, and the derivative of constant 7 is 0.",
        concept: "Power Rule",
      },
      {
        id: "q2",
        text: `Which principle states that the rate of change of momentum of a body is directly proportional to the applied force?`,
        options: ["Newton's First Law", "Newton's Second Law (F=ma)", "Newton's Third Law", "Law of Conservation of Energy"],
        correctOptionIndex: 1,
        explanation: "Newton's Second Law mathematically defines Force as the time derivative of momentum (F = dp/dt = m*a).",
        concept: "Classical Mechanics",
      },
      {
        id: "q3",
        text: `In active recall learning, why is testing more effective than passive re-reading?`,
        options: [
          "It takes less physical energy",
          "It triggers neural retrieval paths and strengthens synaptic consolidation",
          "It only works for multiple choice tests",
          "It eliminates the need for future revision",
        ],
        correctOptionIndex: 1,
        explanation: "Retrieval practice forces the brain to reconstruct memory traces, which significantly enhances long-term retention.",
        concept: "Learning Science",
      },
    ],
    flashcards: [
      { id: "fc1", front: `Definition: Derivative`, back: "The instantaneous rate of change of a function with respect to one of its variables (slope of the tangent line)." },
      { id: "fc2", front: `Spaced Repetition Principle`, back: "Increasing intervals of time between subsequent reviews of previously learned material to exploit the psychological spacing effect." },
      { id: "fc3", front: `Product Rule: (f * g)'`, back: "f'(x)g(x) + f(x)g'(x)" },
    ],
  };
}

function generateFallbackTopics(subjectName: string = "Physics") {
  return {
    overview: `Comprehensive academic roadmap structured for mastery and exam preparedness.`,
    topics: [
      { name: "Unit 1: Kinematics & Motion Vectors", chapterOrUnit: "Chapter 1", difficulty: "easy", estimatedMinutes: 90, keyConcepts: ["Velocity", "Acceleration", "Projectile Motion"] },
      { name: "Unit 2: Newton's Laws & Dynamics", chapterOrUnit: "Chapter 2", difficulty: "medium", estimatedMinutes: 120, keyConcepts: ["Free Body Diagrams", "Friction", "Tension"] },
      { name: "Unit 3: Work, Energy & Conservation", chapterOrUnit: "Chapter 3", difficulty: "medium", estimatedMinutes: 100, keyConcepts: ["Kinetic Energy", "Potential Energy", "Power"] },
      { name: "Unit 4: Rotational Motion & Torque", chapterOrUnit: "Chapter 4", difficulty: "hard", estimatedMinutes: 150, keyConcepts: ["Angular Momentum", "Moment of Inertia", "Center of Mass"] },
      { name: "Unit 5: Oscillations & Wave Mechanics", chapterOrUnit: "Chapter 5", difficulty: "critical", estimatedMinutes: 180, keyConcepts: ["Simple Harmonic Motion", "Doppler Effect", "Superposition"] },
    ],
  };
}

// Start Server with Vite Middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Study Planner server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
