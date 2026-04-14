import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Star,
  Megaphone,
  Bell,
  FileIcon,
  Download,
  Eye,
  CheckCircle2,
  Bold,
  Italic,
  List,
  Info,
  ArrowUpRight,
  LogOut,
  Loader2
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { assignmentService } from '../services/assignmentService';
import type { Submission, Assignment } from '../services/assignmentService';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';
import { doc, getDoc } from 'firebase/firestore';

const LecturerGradingPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Grading State
  const [grade, setGrade] = useState({ ca: 0, exam: 0 });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && submissionId) {
        try {
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);

          // Fetch submission
          const subDoc = await getDoc(doc(db, 'submissions', submissionId));
          if (subDoc.exists()) {
            const subData = { id: subDoc.id, ...subDoc.data() } as Submission;
            setSubmission(subData);
            setGrade({ ca: subData.grade?.ca || 0, exam: subData.grade?.exam || 0 });
            setFeedback(subData.feedback || '');

            // Fetch linked assignment
            const assignDoc = await getDoc(doc(db, 'assignments', subData.assignmentId));
            if (assignDoc.exists()) {
              setAssignment({ id: assignDoc.id, ...assignDoc.data() } as Assignment);
            }
          }
        } catch (err) {
          console.error('Error fetching grading data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [submissionId]);

  const handlePublishGrade = async () => {
    if (!submissionId) return;
    try {
      setIsLoading(true);
      await assignmentService.updateGrade(submissionId, {
        ca: Number(grade.ca),
        exam: Number(grade.exam),
        total: Number(grade.ca) + Number(grade.exam)
      }, feedback);
      alert('Grade published successfully!');
      navigate('/lecturer-dashboard');
    } catch (err) {
      alert('Failed to publish grade');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-screen bg-slate-50 font-outfit overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
        <div className="p-8">
          <Link to="/lecturer-dashboard" className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center p-1.5 shadow-md shadow-blue-200">
                <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white/40 rounded-sm"></div>
                  <div className="bg-white/40 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-extrabold text-slate-800 tracking-tight leading-tight">ACADSUBMIT</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">HIMS Buea</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2">
          {[
            { icon: <LayoutDashboard size={18} />, label: 'Dashboard', active: false, path: '/lecturer-dashboard' },
            { icon: <BookOpen size={18} />, label: 'My Courses', active: false, path: '/lecturer-courses' },
            { icon: <FileText size={18} />, label: 'Assignments', active: false, path: '/lecturer-assignments' },
            { icon: <Star size={18} />, label: 'Grading', active: true, path: '/lecturer-grading' },
            { icon: <Megaphone size={18} />, label: 'Announcements', active: false, path: '#' },
          ].map((item) => (
            <Link
              to={item.path}
              key={item.label}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${item.active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className={item.active ? 'text-white' : 'text-slate-400'}>
                {item.icon}
              </div>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <img 
              src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=0f172a&color=fff`}
              alt={userProfile?.name} 
              className="w-10 h-10 rounded-full border-2 border-slate-100"
            />
            <div className="overflow-hidden">
              <p className="text-[13px] font-extrabold text-slate-900 truncate uppercase tracking-tight">{userProfile?.name || 'Loading...'}</p>
              <p className="text-[10px] font-semibold text-slate-400">{userProfile?.role || 'Lecturer'}</p>
            </div>
          </div>
          <button 
            onClick={async () => { await signOut(auth); navigate('/login'); }}
            className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-[11px] font-extrabold text-slate-600 transition-colors uppercase tracking-wider"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Accessing Submission</p>
          </div>
        )}
        {/* Header */}
        <header className="px-10 py-8 shrink-0 flex items-start justify-between bg-white">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Grading Console</p>
            <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Grading: {submission?.studentName || 'Student'}</h1>
            <p className="text-xs font-bold text-blue-600 mt-1 uppercase tracking-wider">{assignment?.title || 'Unknown Assignment'}</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="w-10 h-10 bg-slate-700 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white">
              {submission?.studentName?.split(' ').map(n => n[0]).join('') || 'ST'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-10 no-scrollbar">
          <div className="flex gap-8">
            {/* Left Section - Grade Details */}
            <div className="flex-1 space-y-8">

              {/* Submitted Files */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5 text-blue-600 font-extrabold text-sm">
                    <FileIcon size={18} />
                    <span>Submitted Files</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-md">1 File Submited</span>
                </div>

                <div className="space-y-4 mb-6">
                  {submission?.fileUrl ? (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                          <FileIcon size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{submission.fileName || 'Assignment Submission'}</p>
                          <p className="text-[10px] font-extrabold text-slate-400 mt-0.5 uppercase">Remote File • Storage Active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={submission.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={18} />
                        </a>
                        <a 
                          href={submission.fileUrl} 
                          download
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-400 italic">No files attached to this submission.</p>
                  )}
                </div>
              </div>

              {/* Grading & Feedback */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                <div className="flex items-center gap-2.5 text-blue-600 font-extrabold text-sm mb-6">
                  <Star size={18} />
                  <span>Grading & Feedback</span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Continuous Assessment (CA)</label>
                      <input
                        type="number"
                        value={grade.ca}
                        onChange={(e) => setGrade({...grade, ca: Number(e.target.value)})}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Examination Score</label>
                      <input
                        type="number"
                        value={grade.exam}
                        onChange={(e) => setGrade({...grade, exam: Number(e.target.value)})}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Lecturer Comments & Feedback</label>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-100">
                      <div className="bg-[#f8fafc] border-b border-slate-100 px-4 py-2.5 flex items-center gap-4 text-slate-400">
                        <button className="hover:text-slate-800 transition-colors"><Bold size={13} /></button>
                        <button className="hover:text-slate-800 transition-colors"><Italic size={13} /></button>
                        <button className="hover:text-slate-800 transition-colors"><List size={14} /></button>
                      </div>
                      <textarea
                        rows={10}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide detailed feedback for the student..."
                        className="w-full p-6 text-sm font-medium text-slate-600 focus:outline-none leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Submission Info */}
            <div className="w-80 shrink-0 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-6">Submission Info</h3>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-2">Grading Status</p>
                    <div className={`flex items-center gap-2 ${submission?.status === 'GRADED' ? 'text-emerald-600' : 'text-orange-500'} text-xs font-bold`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${submission?.status === 'GRADED' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                      {submission?.status || 'PENDING'}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-2">Submitted On</p>
                    <p className="text-xs font-extrabold text-slate-800">{submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '...'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-2">Assignment Due</p>
                    <p className="text-xs font-extrabold text-slate-800">{assignment?.dueDate ? new Date(assignment.dueDate).toLocaleString() : '...'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-2">Maximum Points</p>
                    <p className="text-xs font-extrabold text-slate-800">{assignment?.points || 100} Points Available</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                  <Info size={16} />
                  <h4 className="text-[11px] font-bold uppercase tracking-wider">Grading Tip</h4>
                </div>
                <p className="text-[12px] font-semibold text-slate-600 leading-relaxed">
                  Refer to the <span className="text-blue-600 font-bold cursor-pointer underline decoration-blue-200">CSC 402 Rubric</span>. Schema design accounts for 40% of the total assignment mark.
                </p>
              </div>

              <div className="space-y-3">
                 <button 
                  onClick={handlePublishGrade}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  disabled={isLoading}
                >
                  <ArrowUpRight size={18} />
                  {submission?.status === 'GRADED' ? 'Update Grade' : 'Publish Grade'}
                </button>
                <button className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <FileText size={18} className="text-slate-400" />
                  Save Draft
                </button>
                <button className="w-full py-4 text-slate-400 font-bold text-sm hover:text-rose-500 transition-colors">
                  Cancel & Discard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-10 py-6 border-t border-slate-100 flex justify-between items-center bg-white mt-auto">
          <div className="flex items-center gap-2 text-[11px]">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white">A</div>
            <span className="font-extrabold text-blue-600 uppercase tracking-tighter">ACADSUBMIT Portal</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-slate-400">Higher Institute of Management Studies (HIMS) Buea</span>
          </div>
          <div className="flex gap-6 text-[10px] font-bold text-slate-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Policies</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Help Center</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LecturerGradingPage;
