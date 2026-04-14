import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Star,
  History,
  Search,
  Bell,
  Database,
  Scale,
  Building2,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  MoreHorizontal,
  User,
  LogOut,
  Loader2,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';
import { courseService } from '../services/courseService';
import type { Course } from '../services/courseService';
import { assignmentService } from '../services/assignmentService';
import type { Assignment, Submission } from '../services/assignmentService';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);

          if (profile && profile.department && profile.level) {
            // Fetch courses based on department and level
            const fetchedCourses = await courseService.getCoursesForStudent(profile.department, profile.level);
            setCourses(fetchedCourses);

            if (fetchedCourses.length > 0) {
              const courseIds = fetchedCourses.map(c => c.id);
              const fetchedAssignments = await assignmentService.getAssignmentsByCourses(courseIds);
              setAssignments(fetchedAssignments);
            }

            // Fetch user's submissions
            const fetchedSubmissions = await assignmentService.getSubmissionsByStudent(user.uid);
            setSubmissions(fetchedSubmissions);
          }
        } catch (err) {
          console.error("Error fetching student dashboard data:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const pendingAssignments = assignments.filter(assignment => 
    !submissions.some(sub => sub.assignmentId === assignment.id)
  );

  const completedCount = submissions.length;
  
  // Icon mapping helper
  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('design') || title.toLowerCase().includes('database')) return <Database size={20} className="text-blue-600" />;
    if (title.toLowerCase().includes('ethic')) return <Scale size={20} className="text-purple-600" />;
    return <Building2 size={20} className="text-emerald-600" />;
  };

  return (
    <div className="flex h-screen bg-[#fafafa] font-outfit overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shrink-0 z-10">
        <div className="p-8">
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
            { icon: <LayoutDashboard size={18} />, label: 'Dashboard', active: true, path: '/student-dashboard' },
            { icon: <BookOpen size={18} />, label: 'My Courses', active: false, path: '/student-courses' },
            { icon: <Star size={18} />, label: 'My Grades', active: false, path: '/student-grades' },
            { icon: <History size={18} />, label: 'Upload History', active: false, path: '/upload-history' },
            { icon: <User size={18} />, label: 'Profile', active: false, path: '/student-profile' },
          ].map((item) => (
            <Link
              to={item.path}
              key={item.label}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all ${item.active
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
            className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-rose-500 transition-colors mb-6"
          >
            <LogOut size={18} />
            Logout
          </button>
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">POWERED BY HIMS BUEA</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Syncing Student Portal</p>
          </div>
        )}
        {/* Header */}
        <header className="px-10 py-6 shrink-0 flex items-center justify-between bg-white border-b border-slate-50">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search courses, assignments..."
              className="w-full bg-[#f8fafc] border-none pl-12 pr-4 py-3 rounded-2xl text-[13px] font-semibold focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="text-right">
              <p className="text-[11px] font-extrabold text-slate-800 leading-tight">October 24, 2023</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">First Semester</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-10 no-scrollbar">
          {/* Welcome Section */}
          <div>
            <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              Welcome, {userProfile?.name || 'Student'} 👋 {userProfile?.matricule && <span className="text-xl text-slate-400 font-semibold align-middle ml-2">({userProfile.matricule})</span>}
            </h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">You have {pendingAssignments.length} assignments due this week. Stay focused!</p>
          </div>

          {/* Stats Summary Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Current GPA</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-[34px] font-extrabold text-slate-900 tracking-tighter">3.6</p>
                  <span className="text-[11px] font-extrabold text-emerald-500 flex items-center gap-0.5">
                    <TrendingUp size={12} />
                    +0.2
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-50 rounded-full mt-4 overflow-hidden relative z-10">
                <div className="h-full bg-blue-600 rounded-full w-[72%]"></div>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Completed Tasks</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-[34px] font-extrabold text-slate-900 tracking-tighter">{completedCount}</p>
                  <span className="text-[11px] font-bold text-slate-400">Total Submissions</span>
                </div>
              </div>
              <div className="flex gap-1.5 mt-4 relative z-10">
                {submissions.slice(0, 4).map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                ))}
                {submissions.length > 4 && (
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+{submissions.length - 4}</div>
                )}
              </div>
            </div>

            <div className="bg-blue-600 p-7 rounded-[2rem] shadow-xl shadow-blue-200 flex flex-col justify-between h-44 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-blue-100 uppercase tracking-widest mb-3">Pending Assignments</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-[34px] font-extrabold tracking-tighter">{pendingAssignments.length.toString().padStart(2, '0')}</p>
                  <span className="text-[11px] font-bold text-blue-100">Action required</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/assignments/all')}
                className="w-full bg-white text-blue-600 font-extrabold py-3 rounded-2xl text-[13px] mt-4 hover:bg-blue-50 transition-colors relative z-10 shadow-sm"
              >
                View All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Pending Assignments List */}
            <div className="col-span-8 space-y-6">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Pending Assignments</h3>
                <Link to="#" className="text-[11px] font-extrabold text-blue-600 hover:text-blue-700 uppercase tracking-widest">See calendar</Link>
              </div>

              <div className="space-y-4">
                {pendingAssignments.length === 0 && !isLoading && (
                  <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center">
                    <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">All Caught Up!</p>
                    <p className="text-xs text-slate-300 mt-2">No pending assignments for your modules.</p>
                  </div>
                )}
                {pendingAssignments.map((assignment, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                    className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center group-hover:scale-105 transition-transform">
                        {getIcon(assignment.title)}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-extrabold text-slate-900 tracking-tight">{assignment.title}</h4>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Points: <span className="text-slate-600">{assignment.points}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <span className="text-[10px] font-bold px-3 py-1 bg-rose-50 text-rose-500 rounded-full uppercase tracking-wider">
                           DUE {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <p className="text-[11px] font-bold text-slate-400 mt-2 italic flex items-center gap-1.5 justify-end">
                          <Clock size={12} />
                          Action Required
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Courses Section */}
            <div className="col-span-4 space-y-6">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">My Courses</h3>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {courses.map((course, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-5">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-blue-50/50 rounded-xl flex items-center justify-center text-blue-500">
                        <BookOpen size={18} />
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest leading-none">{course.code}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 leading-tight mb-4">{course.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <span>Status</span>
                          <span className="text-emerald-500">{course.status}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                          <div className={`h-full bg-blue-500 rounded-full transition-all duration-1000`} style={{ width: `100%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
