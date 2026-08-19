import React, { useState } from 'react';
import {
  Building2,
  Users,
  FlaskConical,
  Mail,
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { CollegeData, Department } from '../types';

interface DepartmentsViewProps {
  collegeData: CollegeData;
  onAskAI: (query: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  collegeData,
  onAskAI,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDepartments = collegeData.departments.filter((dept) => {
    const q = searchQuery.toLowerCase();
    return (
      dept.name.toLowerCase().includes(q) ||
      dept.code.toLowerCase().includes(q) ||
      dept.hod.toLowerCase().includes(q) ||
      dept.specializations.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Academic Departments</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore faculties, specialized research labs, HOD contacts, and degree tracks.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments, HODs, labs…"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header: Name and Code */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                    {dept.code}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                    {dept.name}
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  Est. {dept.establishedYear}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {dept.description}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2 py-1 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold uppercase">Faculty</span>
                    <span className="font-bold text-slate-800">{dept.facultyCount} Professors</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold uppercase">Students</span>
                    <span className="font-bold text-slate-800">{dept.studentCount} Enrolled</span>
                  </div>
                </div>
              </div>

              {/* HOD Contact */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
                <div className="font-bold text-slate-900">
                  Head of Department: <span className="text-blue-950">{dept.hod}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <a href={`mailto:${dept.hodEmail}`} className="text-blue-700 hover:underline font-mono text-[11px]">
                    {dept.hodEmail}
                  </a>
                </div>
              </div>

              {/* Specialized Labs */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Research & Practical Labs:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dept.labs.map((lab, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium flex items-center gap-1"
                    >
                      <FlaskConical className="w-3 h-3 text-slate-400" />
                      <span>{lab}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Key Focus Areas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dept.specializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => onAskAI(`Tell me about the Department of ${dept.name}, its faculty, labs, and research opportunities.`)}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white text-xs font-bold border border-slate-200 hover:border-blue-600 transition-all flex items-center justify-center gap-2 group mt-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" />
              <span>Ask AI about {dept.code}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
