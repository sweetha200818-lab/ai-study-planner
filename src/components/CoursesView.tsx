import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  CreditCard,
  Users,
  Award,
  CheckCircle2,
  Briefcase,
  Sparkles,
  ArrowRight,
  Search
} from 'lucide-react';
import { CollegeData, Course, DegreeLevel } from '../types';

interface CoursesViewProps {
  collegeData: CollegeData;
  onAskAI: (query: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  collegeData,
  onAskAI,
}) => {
  const [selectedDegree, setSelectedDegree] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = collegeData.courses.filter((course) => {
    const matchesDegree = selectedDegree === 'All' || course.degree === selectedDegree;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      course.name.toLowerCase().includes(q) ||
      course.departmentName.toLowerCase().includes(q) ||
      course.eligibility.toLowerCase().includes(q);
    return matchesDegree && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Academic Programs & Courses</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Undergraduate and Postgraduate degree offerings, eligibility criteria, and fee structures.
          </p>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Undergraduate', 'Postgraduate'].map((deg) => (
            <button
              key={deg}
              onClick={() => setSelectedDegree(deg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDegree === deg
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {deg}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3.5">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {course.degree}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {course.departmentName}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {course.name}
                  </h2>
                </div>
              </div>

              {/* Badges: Duration, Annual Fee, Seats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block font-bold uppercase">Duration</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{course.duration.split('(')[0]}</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block font-bold uppercase">Annual Tuition</span>
                  <span className="font-bold text-blue-700 flex items-center gap-1 mt-0.5">
                    ₹{course.annualTuitionFee.toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block font-bold uppercase">Intake</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{course.seatIntake} Seats</span>
                  </span>
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Admission Eligibility:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {course.eligibility}
                </p>
              </div>

              {/* Curriculum Highlights */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Core Subjects & Modules:
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {course.curriculumHighlights.slice(0, 4).map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Career Opportunities */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Career Pathways:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {course.careerOpportunities.map((career, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-200 flex items-center gap-1"
                    >
                      <Briefcase className="w-3 h-3 text-blue-500" />
                      <span>{career}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => onAskAI(`What is the admission procedure, syllabus, and career scope for ${course.name}?`)}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white text-xs font-bold border border-slate-200 hover:border-blue-600 transition-all flex items-center justify-center gap-2 group mt-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" />
              <span>Ask AI about {course.code}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
