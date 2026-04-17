import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  TrendingUp,
  Award,
  GraduationCap,
  Eye,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { UserProfile } from '../services/userService';
import { userService } from '../services/userService';
import type { Submission } from '../services/assignmentService';
import { assignmentService } from '../services/assignmentService';
import { collection, getDocs } from 'firebase/firestore';

const StudentGradesPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<(Submission & { assignmentTitle?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);

          const fetchedSubmissions = await assignmentService.getSubmissionsByStudent(user.uid);

          // Fetch assignment titles for context
          const assignmentsSnap = await getDocs(collection(db, 'assignments'));
          const titlesMap: Record<string, string> = {};
          assignmentsSnap.docs.forEach(doc => {
            titlesMap[doc.id] = doc.data().title;
          });

          const enriched = fetchedSubmissions.map(sub => ({
            ...sub,
            assignmentTitle: titlesMap[sub.assignmentId] || 'Unknown Module'
          }));

          setSubmissions(enriched);
        } catch (err) {
          console.error("Error fetching grades:", err);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const getLetterGrade = (total: number) => {
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Collating Results</p>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Academic Records</p>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Overview</h1>
        <p className="text-[15px] font-medium text-slate-500">First Semester, Academic Year 2023/2024</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10 mt-6">
        <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 flex flex-col justify-between h-40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-4">
                <TrendingUp size={18} />
              </div>
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1">Graded Submissions</p>
              <p className="text-[28px] font-extrabold tracking-tighter">{submissions.filter((s: Submission) => s.status === 'GRADED').length} Courses</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <GraduationCap size={18} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Review</p>
            <p className="text-[28px] font-extrabold text-slate-900 tracking-tighter">{submissions.filter((s: Submission) => s.status === 'PENDING').length} Items</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Award size={18} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Academic Status</p>
            <p className="text-[24px] font-extrabold text-slate-900 tracking-tight">Active Student</p>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-0 font-bold"></div>
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-4">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Level</p>
            <p className="text-[28px] font-extrabold tracking-tighter">{userProfile?.level || '...'}</p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">Semester Results Breakdown</h3>
          <div className="flex gap-2 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Finalized</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> CA Only</span>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50 bg-[#fafafa]/50">
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">COURSE DETAILS</th>
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-center">CA (30)</th>
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-center">EXAM (70)</th>
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-center">TOTAL</th>
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-center">GRADE</th>
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-center">FEEDBACK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {submissions.map((sub: Submission & { assignmentTitle?: string }, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shadow-sm">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <p className="text-[14px] font-extrabold text-slate-800 tracking-tight leading-tight">{sub.assignmentTitle}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">SUBMITTED ON: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center text-sm font-bold text-slate-600">{sub.grade?.ca ?? '-'}</td>
                <td className="px-8 py-6 text-center text-sm font-bold text-slate-600">
                  {sub.status === 'PENDING' ? (
                    <span className="flex items-center justify-center gap-1.5 text-blue-500 text-[10px] font-extrabold uppercase bg-blue-50 py-1.5 px-3 rounded-lg mx-auto w-max">
                      <Clock size={12} />
                      Pending
                    </span>
                  ) : (
                    sub.grade?.exam ?? '-'
                  )}
                </td>
                <td className="px-8 py-6 text-center text-[16px] font-extrabold text-slate-900">{sub.grade?.total ?? '-'}</td>
                <td className="px-8 py-6 text-center">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-extrabold ${sub.grade ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                    {sub.grade ? getLetterGrade(sub.grade.total) : '-'}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <button
                    onClick={() => sub.feedback ? alert(`Lecturer Feedback: ${sub.feedback}`) : alert('No feedback provided yet.')}
                    className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all mx-auto shadow-sm"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold italic">No results available yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-emerald-900">Keep it up, {userProfile?.name?.split(' ')[0] || 'Student'}!</h4>
          <p className="text-xs font-bold text-emerald-700 mt-0.5">Your academic performance is being updated in real-time as lecturers finalize grades.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentGradesPage;
