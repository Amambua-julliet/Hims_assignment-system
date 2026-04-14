import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  History, 
  User, 
  BookOpen, 
  LogOut, 
  Bell, 
  Upload,
  Star,
  Search,
  ChevronDown,
  SlidersHorizontal,
  FileText,
  Download,
  Eye,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { UserProfile } from '../services/userService';
import { userService } from '../services/userService';
import type { Submission } from '../services/assignmentService';
import { assignmentService } from '../services/assignmentService';
import { collection, getDocs } from 'firebase/firestore';

const UploadHistoryPage: React.FC = () => {
  const navigate = useNavigate();
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
            assignmentTitle: titlesMap[sub.assignmentId] || 'Unknown Assignment'
          }));

          setSubmissions(enriched);
        } catch (err) {
          console.error("Error fetching upload history:", err);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-[#fafafa] font-outfit overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 z-10">
        <div className="p-8 pb-10">
          <Link to="/student-dashboard" className="flex flex-col gap-1">
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
                <span className="text-[15px] font-extrabold text-blue-600 tracking-tight leading-tight">ACADSUBMIT</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">HIMS Buea</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          {[
            { icon: <LayoutDashboard size={18} />, label: 'Dashboard', active: false, path: '/student-dashboard' },
            { icon: <History size={18} />, label: 'Upload History', active: true, path: '/upload-history' },
            { icon: <Star size={18} />, label: 'My Grades', active: false, path: '/student-grades' },
            { icon: <User size={18} />, label: 'Profile', active: false, path: '/student-profile' },
            { icon: <BookOpen size={18} />, label: 'My Courses', active: false, path: '/student-courses' },
          ].map((item) => (
            <Link
              to={item.path}
              key={item.label}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-[13px] font-bold transition-all ${item.active
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className={item.active ? 'text-blue-600 font-bold' : 'text-slate-400'}>
                {item.icon}
              </div>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-50">
          <button 
            onClick={async () => { await signOut(auth); navigate('/login'); }}
            className="flex items-center gap-3 text-[13px] font-bold text-slate-600 hover:text-rose-500 transition-colors mb-6"
          >
            <LogOut size={18} />
            Logout
          </button>
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">POWERED BY HIMS BUEA</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Accessing History</p>
          </div>
        )}
        {/* Header (Top Info Bar) */}
        <div className="px-10 py-5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Link to="/student-dashboard" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-slate-900">Upload History</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[13px] font-extrabold text-slate-900 leading-tight">{userProfile?.name || 'Student'}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{userProfile?.department} • {userProfile?.level}</p>
            </div>
            <img 
              src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=0f172a&color=fff`}
              alt="Profile" 
              className="w-10 h-10 rounded-xl border border-slate-100 shadow-sm"
            />
            <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 bg-white rounded-full hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-10 no-scrollbar">
          {/* Page Heading Section */}
          <div className="flex items-center justify-between mt-6 mb-10">
            <div>
              <h1 className="text-[32px] font-extrabold text-slate-900 tracking-tight">Your Submissions</h1>
              <p className="text-[15px] font-medium text-slate-400 mt-2">Manage and track your academic document uploads for the current semester.</p>
            </div>
            <button 
              onClick={() => navigate('/assignments/all')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-extrabold text-[14px] flex items-center gap-3 shadow-lg shadow-blue-200 transition-all"
            >
              <Upload size={18} />
              New Upload
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-[#f8fafc] rounded-3xl p-3 flex items-center gap-3 mb-8 shadow-sm ring-1 ring-slate-100/50">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by filename or assignment..."
                className="w-full bg-white border-none pl-12 pr-4 py-3.5 rounded-2xl text-[14px] font-semibold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-white border-none pl-6 pr-12 py-3.5 rounded-2xl text-[14px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer shadow-sm">
                <option>All Statuses</option>
                <option>Graded</option>
                <option>Pending Review</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <button className="w-[52px] h-[52px] bg-white text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm ring-1 ring-slate-100/50">
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-[#fafafa]/50">
                  <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">FILENAME</th>
                  <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">ASSIGNMENT</th>
                  <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">UPLOAD DATE</th>
                  <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">STATUS</th>
                  <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {submissions.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shadow-sm`}>
                          <FileText size={20} />
                        </div>
                        <span className="text-[14px] font-extrabold text-blue-600 hover:underline cursor-pointer tracking-tight truncate max-w-[200px]">{row.fileName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div>
                        <p className="text-[14px] font-bold text-slate-800 leading-tight">{row.assignmentTitle}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Academic Year 2023/2024</p>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div>
                        <p className="text-[14px] font-extrabold text-slate-800 tracking-tight">{new Date(row.submittedAt).toLocaleDateString()},</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5 tracking-tight uppercase">{new Date(row.submittedAt).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${row.status === 'GRADED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center justify-center gap-4 text-slate-300 group-hover:text-slate-400">
                        <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                          <Eye size={18} />
                        </a>
                        <a href={row.fileUrl} download={row.fileName} className="hover:text-blue-600 transition-colors">
                          <Download size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">No submissions found in your history.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadHistoryPage;
