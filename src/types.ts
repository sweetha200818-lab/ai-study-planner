export type DegreeLevel = 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'Doctoral';

export interface Department {
  id: string;
  name: string;
  code: string;
  hod: string;
  hodEmail: string;
  establishedYear: number;
  facultyCount: number;
  studentCount: number;
  labs: string[];
  description: string;
  specializations: string[];
}

export interface Course {
  id: string;
  departmentId: string;
  departmentName: string;
  name: string;
  code: string;
  degree: DegreeLevel;
  duration: string; // e.g. "4 Years (8 Semesters)"
  annualTuitionFee: number;
  eligibility: string;
  seatIntake: number;
  curriculumHighlights: string[];
  careerOpportunities: string[];
}

export interface ExamInfo {
  id: string;
  title: string;
  session: string;
  scheduleRange: string;
  hallTicketReleaseDate: string;
  passCriteria: string;
  revaluationDeadline: string;
  gradingSystem: string;
  rules: string[];
}

export interface FeeStructure {
  id: string;
  category: string;
  amount: string;
  frequency: string;
  dueDate: string;
  modeOfPayment: string;
  lateFeePolicy: string;
  scholarships: string[];
}

export interface Facility {
  id: string;
  name: string;
  category: string;
  timings: string;
  location: string;
  features: string[];
  contactPerson: string;
}

export interface OfficeTiming {
  officeName: string;
  workingDays: string;
  timings: string;
  lunchBreak: string;
  location: string;
  inCharge: string;
}

export interface CollegeContact {
  designation: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  officeRoom: string;
}

export interface CollegeData {
  collegeName: string;
  shortName: string;
  tagline: string;
  code: string;
  establishedYear: number;
  accreditation: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  generalPhone: string;
  admissionPhone: string;
  generalEmail: string;
  admissionEmail: string;
  website: string;
  principalName: string;
  emergencyHelpline: string;
  antiRaggingHelpline: string;
  officeTimings: OfficeTiming[];
  departments: Department[];
  courses: Course[];
  exams: ExamInfo[];
  fees: FeeStructure[];
  facilities: Facility[];
  contacts: CollegeContact[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: 'courses' | 'departments' | 'exams' | 'fees' | 'campus' | 'contact' | 'general';
  quickFollowUps?: string[];
}
