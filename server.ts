import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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
      console.warn("GEMINI_API_KEY environment variable is not set. Using intelligent semantic fallback mode.");
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

/**
 * 1. College AI Knowledge Assistant Chat Endpoint
 * Answers student questions using the active college knowledge base.
 */
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, history, collegeKnowledge } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const college = collegeKnowledge || {};

    const systemInstruction = `
You are the official "College AI Knowledge Assistant" for ${college.collegeName || "the College"}.
Your primary goal is to help college students, applicants, and faculty quickly get accurate, clear, and helpful answers to their questions.

Rules & Guidelines:
1. Short, Clear & Useful: Provide direct, concise, and structured answers (using short bullet points or bold highlights when appropriate). Keep response lengths focused and easy to scan on mobile screens.
2. Grounded strictly in College Knowledge: Use ONLY the provided college knowledge data below to answer queries regarding departments, courses, fees, exams, office timings, campus facilities, faculty contacts, eligibility, and rules.
3. Unavailable Information Policy: If the requested information is not present or cannot be determined from the college knowledge data, explicitly say:
   "Sorry, I don't have that information."
   Optionally suggest contacting the relevant college office (e.g., Admissions Desk at ${college.admissionPhone || "the main office"} or email ${college.generalEmail || "info@college.edu"}).
4. Context & Follow-ups: Maintain conversation context and answer follow-up questions naturally.
5. Tone: Polite, student-friendly, professional, encouraging, and clear.

Current College Knowledge Base:
- College Name: ${college.collegeName} (${college.shortName})
- Tagline: ${college.tagline}
- Code / Established: ${college.code} • Est. ${college.establishedYear}
- Accreditation: ${college.accreditation}
- Address: ${college.address}, ${college.city}, ${college.state} - ${college.pincode}
- General Phone: ${college.generalPhone}
- Admission Phone: ${college.admissionPhone}
- General Email: ${college.generalEmail}
- Admission Email: ${college.admissionEmail}
- Website: ${college.website}
- Principal: ${college.principalName}
- Emergency Helpline: ${college.emergencyHelpline}
- Anti-Ragging Helpline: ${college.antiRaggingHelpline}

Office Timings & Locations:
${JSON.stringify(college.officeTimings || [], null, 2)}

Departments:
${JSON.stringify(college.departments || [], null, 2)}

Courses & Fee Structure:
${JSON.stringify(college.courses || [], null, 2)}

Examination Rules & Schedule:
${JSON.stringify(college.exams || [], null, 2)}

Fee Structure & Scholarships:
${JSON.stringify(college.fees || [], null, 2)}

Campus Facilities:
${JSON.stringify(college.facilities || [], null, 2)}

Important Contacts & Officials:
${JSON.stringify(college.contacts || [], null, 2)}
`;

    const ai = getAIClient();

    if (process.env.GEMINI_API_KEY) {
      const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (history && Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.text) {
            formattedContents.push({
              role: item.sender === "user" ? "user" : "model",
              parts: [{ text: item.text }],
            });
          }
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
          temperature: 0.3,
        },
      });

      const replyText = response.text || "Sorry, I don't have that information.";
      return res.json({ success: true, reply: replyText });
    } else {
      // High quality semantic rule-based fallback when GEMINI_API_KEY is not configured
      const fallbackReply = generateSemanticFallback(message, college);
      return res.json({ success: true, reply: fallbackReply, fallback: true });
    }
  } catch (error: any) {
    console.error("College AI Chat error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process question",
    });
  }
});

/**
 * Robust fallback matching engine when running without an external API key
 */
function generateSemanticFallback(query: string, college: any): string {
  const q = (query || "").toLowerCase();

  // 1. Contact, phone, email, address
  if (q.includes("contact") || q.includes("phone") || q.includes("email") || q.includes("address") || q.includes("where is") || q.includes("reach") || q.includes("principal") || q.includes("helpline")) {
    if (q.includes("principal")) {
      return `**Principal:** ${college.principalName || "Dr. K. S. Ramanathan"}\nEmail: \`principal@apextech.edu.in\`\nPhone: ${college.generalPhone || "+91 (044) 2854-9100"}`;
    }
    if (q.includes("admission")) {
      return `**Admissions Office Contact:**\n- Phone: **${college.admissionPhone || "+91 98401-23456"}**\n- Email: **${college.admissionEmail || "admissions@apextech.edu.in"}**\n- Location: Admissions Block, Ground Floor`;
    }
    if (q.includes("emergency") || q.includes("anti-ragging") || q.includes("ragging")) {
      return `**Emergency Helplines:**\n- Campus Security & Ambulance: **${college.emergencyHelpline || "+91 94440-11223"}**\n- Anti-Ragging Helpline: **${college.antiRaggingHelpline || "1800-180-5522"}**`;
    }
    return `**${college.collegeName || "Apex Institute of Engineering & Technology"}**\n- **Address:** ${college.address || "Apex Knowledge Park, Tech Valley Avenue"}, ${college.city || "Metro City"} - ${college.pincode || "600096"}\n- **Phone:** ${college.generalPhone || "+91 (044) 2854-9100"}\n- **Email:** ${college.generalEmail || "info@apextech.edu.in"}\n- **Admissions Desk:** ${college.admissionPhone || "+91 98401-23456"}\n- **Website:** ${college.website || "www.apextech.edu.in"}`;
  }

  // 2. Fees & Scholarships
  if (q.includes("fee") || q.includes("cost") || q.includes("tuition") || q.includes("hostel fee") || q.includes("scholarship") || q.includes("payment")) {
    if (q.includes("hostel")) {
      const hostelFee = college.fees?.find((f: any) => f.id === "fee-hostel") || { amount: "₹65,000 – ₹95,000 / year" };
      return `**Hostel & Mess Fee:**\n- **Amount:** ${hostelFee.amount}\n- **Inclusions:** Accommodation (AC/Non-AC options) with multi-cuisine dining.\n- **Payment Mode:** Online Student ERP Portal or Demand Draft.`;
    }
    if (q.includes("scholarship")) {
      return `**Scholarships Available at ${college.shortName || "the College"}:**\n- **Merit Scholarship:** 100% tuition waiver for Board toppers & high entrance rankers.\n- **Sports Scholarship:** 50% waiver for State/National level athletes.\n- **First-Generation Graduate:** Government-aided tuition grant.\n- **EWS Financial Aid:** Need-based tuition assistance.`;
    }
    return `**Academic Fee Overview:**\n- **B.Tech Tuition:** ₹95,000 – ₹1,35,000 per year (varies by department).\n- **M.Tech Tuition:** ₹85,000 per year.\n- **MBA Tuition:** ₹1,40,000 per year.\n- **Hostel Fee:** ₹65,000 – ₹95,000 per year.\n- **Payment Due Dates:** Odd Sem: July 31 • Even Sem: January 15.\n*Payments are accepted via the Student ERP Portal or NetBanking.*`;
  }

  // 3. Exams & Results
  if (q.includes("exam") || q.includes("hall ticket") || q.includes("grade") || q.includes("cgpa") || q.includes("revaluation") || q.includes("pass mark") || q.includes("attendance")) {
    const exam = college.exams?.[0] || {};
    if (q.includes("attendance")) {
      return `**Attendance Requirement:**\nA minimum of **75% attendance** in each course is strictly mandatory to be eligible for semester end examination hall ticket issuance.`;
    }
    if (q.includes("pass")) {
      return `**Passing Criteria:**\n- Minimum **40% marks** in the End-Semester Theory examination.\n- Minimum **50% aggregate** combining Continuous Internal Assessments (CAT) and End Sem.`;
    }
    return `**Semester Examination Information:**\n- **Upcoming Exam:** ${exam.title || "Even Semester End Examinations 2026"}\n- **Schedule:** ${exam.scheduleRange || "Practical: May 04-12, 2026 • Theory: May 18 - June 10, 2026"}\n- **Hall Tickets:** Released on Student Portal on ${exam.hallTicketReleaseDate || "May 02, 2026"}.\n- **Grading System:** 10-Point Relative CGPA Scale (O, A+, A, B+, B, C, F).\n- **Revaluation:** Apply within 10 days of results via portal (₹500/paper).`;
  }

  // 4. Courses & Eligibility
  if (q.includes("course") || q.includes("b.tech") || q.includes("btech") || q.includes("mtech") || q.includes("mba") || q.includes("eligib") || q.includes("intake") || q.includes("duration") || q.includes("cse") || q.includes("ai")) {
    if (q.includes("cse") || q.includes("computer science")) {
      const cse = college.courses?.find((c: any) => c.code === "BTECH-CSE");
      return `**B.Tech in Computer Science & Engineering (CSE):**\n- **Duration:** 4 Years (8 Semesters)\n- **Annual Tuition:** ₹1,25,000 / year\n- **Seat Intake:** 180 seats\n- **Eligibility:** 10+2 with minimum 60% aggregate in Physics, Math & Chemistry/CS + Entrance merit.\n- **Key Specializations:** AI & Deep Learning, Cloud Computing, Cybersecurity, Full-Stack.`;
    }
    if (q.includes("ai") || q.includes("data science")) {
      return `**B.Tech in Artificial Intelligence & Data Science (AI&DS):**\n- **Duration:** 4 Years (8 Semesters)\n- **Annual Tuition:** ₹1,35,000 / year\n- **Seat Intake:** 120 seats\n- **Eligibility:** 10+2 with 60% in Physics & Math.\n- **Focus Areas:** Machine Learning, Computer Vision, Generative AI, Big Data.`;
    }
    if (q.includes("mba")) {
      return `**Master of Business Administration (MBA):**\n- **Duration:** 2 Years (4 Semesters)\n- **Annual Tuition:** ₹1,40,000 / year\n- **Seat Intake:** 120 seats\n- **Eligibility:** Bachelor's degree (50% aggregate) + CAT/MAT/TANCET score.\n- **Specializations:** Finance, Marketing, HR, Business Analytics.`;
    }
    return `**Academic Courses Offered at ${college.shortName || "the College"}:**\n- **B.Tech CSE** (180 seats • ₹1.25L/yr)\n- **B.Tech AI & Data Science** (120 seats • ₹1.35L/yr)\n- **B.Tech ECE** (120 seats • ₹1.10L/yr)\n- **B.Tech IT** (120 seats • ₹1.20L/yr)\n- **B.Tech Mechanical** (60 seats • ₹95k/yr)\n- **M.Tech CSE** (30 seats • ₹85k/yr)\n- **MBA** (120 seats • ₹1.40L/yr)`;
  }

  // 5. Departments
  if (q.includes("department") || q.includes("hod") || q.includes("faculty") || q.includes("lab")) {
    return `**Departments & Heads of Department (HODs):**\n- **Computer Science & Engineering:** Dr. S. Venkatesh (\`hod.cse@apextech.edu.in\`)\n- **AI & Data Science:** Dr. Priya Narayanan (\`hod.aids@apextech.edu.in\`)\n- **Electronics & Communication:** Dr. M. Rajesh (\`hod.ece@apextech.edu.in\`)\n- **Information Technology:** Dr. B. Lakshmi (\`hod.it@apextech.edu.in\`)\n- **Mechanical Engineering:** Dr. G. Sivakumar (\`hod.mech@apextech.edu.in\`)\n- **Management Studies (MBA):** Dr. Anita Roy (\`hod.mba@apextech.edu.in\`)`;
  }

  // 6. Campus Facilities (Library, Hostel, Sports, Canteen, Medical, Placement)
  if (q.includes("facility") || q.includes("facilities") || q.includes("library") || q.includes("hostel") || q.includes("sports") || q.includes("gym") || q.includes("canteen") || q.includes("cafeteria") || q.includes("medical") || q.includes("hospital") || q.includes("placement") || q.includes("package") || q.includes("wifi")) {
    if (q.includes("library")) {
      return `**Central Library:**\n- **Timings:** 08:00 AM – 10:00 PM (Mon–Sat) • 09:00 AM – 05:00 PM (Sun)\n- **Location:** Central Library Building (4 Floors, Air-Conditioned)\n- **Resources:** 85,000+ books, IEEE Xplore, ScienceDirect, and 200-seat Digital E-Learning Lab.`;
    }
    if (q.includes("placement") || q.includes("salary") || q.includes("package")) {
      return `**Placement Highlights (2024–25):**\n- **Placement Rate:** 94.2%\n- **Highest Package:** ₹44.5 LPA\n- **Average Package:** ₹7.8 LPA\n- **Top Recruiters:** Google, Microsoft, Amazon, Zoho, TCS, Infosys, Qualcomm, L&T.\n- **Director:** Mr. David Paul (\`placement@apextech.edu.in\`)`;
    }
    if (q.includes("medical") || q.includes("health") || q.includes("doctor")) {
      return `**Campus Health Center:**\n- **Timings:** 24/7 Round-the-clock Resident Doctor & Nurses.\n- **Location:** Amenities Block, Room 10.\n- **Services:** Free consultation, generic medications, 4-bed clinic, on-standby ACLS Ambulance.\n- **Helpline:** +91 94440-11223`;
    }
    return `**Campus Facilities at ${college.shortName || "the College"}:**\n- **Central Library:** 85,000+ volumes, IEEE digital access, open till 10:00 PM.\n- **Hostels:** Ganga (Boys) & Kaveri (Girls) with Wi-Fi, 24/7 power & RO water.\n- **Sports & Gym:** 400m track, floodlit courts, indoor badminton & modern gym.\n- **Food Court:** FSSAI-certified multi-cuisine cafeteria open 7:30 AM – 9:30 PM.\n- **Medical Center:** 24/7 clinic with resident doctor and emergency ambulance.\n- **Placement Cell:** 94.2% placement rate, highest CTC ₹44.5 LPA.`;
  }

  // 7. Office Timings
  if (q.includes("timing") || q.includes("time") || q.includes("working hours") || q.includes("office hours") || q.includes("open")) {
    return `**Official College & Office Timings:**\n- **Administrative Office:** Mon–Fri, 08:30 AM – 04:30 PM (Lunch: 1:00 PM – 1:45 PM)\n- **Controller of Exams (CoE):** Mon–Fri, 09:00 AM – 05:00 PM\n- **Central Library:** Mon–Sat, 08:00 AM – 10:00 PM (Sunday: 9:00 AM – 5:00 PM)\n- **Food Court / Cafeteria:** 07:30 AM – 09:30 PM (Open all 7 days)\n- **Medical Emergency Center:** 24 Hours Open`;
  }

  // 8. Default fallback when information is unavailable
  return `Sorry, I don't have that information.\n\nFor specific inquiries, please contact the **College Administrative Helpdesk** at **${college.generalPhone || "+91 (044) 2854-9100"}** or email **${college.generalEmail || "info@apextech.edu.in"}**.`;
}

// Start Server with Vite Middleware
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
    console.log(`College AI Knowledge Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
