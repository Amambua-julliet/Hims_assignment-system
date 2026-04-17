import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  User,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { assignmentService } from '../services/assignmentService';
import type { Submission } from '../services/assignmentService';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const LecturerGradingFeed: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<(Submission & { assignmentTitle?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'GRADED'>('ALL');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const fetchedSubmissions = await assignmentService.getSubmissionsForLecturer(user.uid);
          
          // Enrich with assignment titles
          const assignmentsSnap = await getDocs(collection(db, 'assignments'));
          const titlesMap: Record<string, string> = {};
          assignmentsSnap.docs.forEach((doc: any) => {
            titlesMap[doc.id] = doc.data().title;
          });

          const enriched = fetchedSubmissions.map((sub: Submission) => ({
            ...sub,
            assignmentTitle: titlesMap[sub.assignmentId] || 'Unknown Assignment'
          }));

          setSubmissions(enriched);
        } catch (err: any) {
          console.error('Error fetching submissions:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.assignmentTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-orange-100">
            <Clock size={10} strokeWidth={3} />
            Pending Review
          </span>
        );
      case 'GRADED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-emerald-100">
            <CheckCircle2 size={10} strokeWidth={3} />
            Graded
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-slate-100">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Syncing Submissions</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1">Assessment Engine</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Grading Feed</h1>
              <p className="text-sm font-medium text-slate-500">Review and provide feedback on student submissions.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by student or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 w-64 shadow-sm"
            />
          </div>
          <div className="flex bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
            {(['ALL', 'PENDING', 'GRADED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                  statusFilter === status 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Awaiting Review</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">
              {submissions.filter((s: Submission) => s.status === 'PENDING').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Successfully Graded</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">
              {submissions.filter((s: Submission) => s.status === 'GRADED').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Total Submissions</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">{submissions.length}</p>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Student Detail</th>
                <th className="px-8 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Assignment</th>
                <th className="px-8 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Submitted Date</th>
                <th className="px-8 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                    No submissions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr 
                    key={sub.id}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/lecturer-grading/${sub.id}`)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {sub.studentName?.split(' ').map(n => n[0]).join('') || 'ST'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{sub.studentName}</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Year 1 • Computer Eng.</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-800 tracking-tight">{sub.assignmentTitle || 'Untitled Assignment'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <BookOpen size={12} className="text-blue-500" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database Principles</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-semibold text-slate-500">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LecturerGradingFeed;
