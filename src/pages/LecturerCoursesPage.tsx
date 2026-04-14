import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Bell, 
  Search,
  Filter,
  ChevronRight,
  LogOut,
  Building2,
  GraduationCap,
  Clock,
  Star,
  Megaphone,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { courseService } from '../services/courseService';
import type { Course } from '../services/courseService';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';
import { onAuthStateChanged } from 'firebase/auth';

const LecturerCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile to get name/title
          const profile = await userService.getUserById(user.uid);
          setUserProfile(profile);

          // Fetch courses assigned to this lecturer
          const lecturerCourses = await courseService.getCoursesByLecturer(user.uid);
          setCourses(lecturerCourses);
        } catch (err) {
          console.error('Error fetching lecturer data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const [recentSelections] = useState([
    { level: 'LEVEL 400', dept: 'Computer Science', time: 'Last accessed 2 hours ago' },
    { level: 'LEVEL 200', dept: 'Software Engineering', time: 'Last accessed yesterday' },
    { level: 'LEVEL 300', dept: 'Mathematics & Stats', time: 'Last accessed 3 days ago' },
  ]);

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
              </div>
            </div>
          </Link>
        </div>

         <nav className="flex-1 px-4 py-2 space-y-2">
           {[
             { icon: <LayoutDashboard size={18} />, label: 'Dashboard', active: false, path: '/lecturer-dashboard' },
             { icon: <BookOpen size={18} />, label: 'My Courses', active: true, path: '/lecturer-courses' },
             { icon: <FileText size={18} />, label: 'Assignments', active: false, path: '/lecturer-assignments' },
             { icon: <Star size={18} />, label: 'Grading', active: false, path: '/lecturer-grading' },
             { icon: <Megaphone size={18} />, label: 'Announcements', active: false, path: '#' },
           ].map((item) => (
             <Link
               to={item.path}
               key={item.label}
               className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${
                 item.active 
                   ? 'bg-blue-50 text-blue-600' 
                   : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
               }`}
             >
               <div className={item.active ? 'text-blue-600' : 'text-slate-400'}>
                 {item.icon}
               </div>
               {item.label}
             </Link>
           ))}
         </nav>

        <div className="p-6 flex flex-col gap-3">
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
            onClick={() => auth.signOut()}
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-[11px] font-extrabold text-slate-600 transition-colors uppercase tracking-wider"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#fafafa] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-blue-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Synchronizing Portal</p>
          </div>
        )}
        {/* Header */}
        <header className="px-10 py-5 shrink-0 flex items-center justify-between bg-white border-b border-slate-100">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search courses, students..."
              className="w-full bg-slate-50 border-none pl-12 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="w-10 h-10 bg-slate-600 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white cursor-pointer">
              SA
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-10 no-scrollbar">
          <div className="space-y-8">
            <div>
              <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Welcome back, {userProfile?.name?.split(' ')[0] || 'Lecturer'}.</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Select an assigned course to manage submissions and grades.</p>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex overflow-hidden">
              {/* Left Side */}
              <div className="w-5/12 bg-[#f4f8ff] p-12 flex flex-col items-center text-center justify-center border-r border-[#e6efff]">
                <div className="w-[72px] h-[72px] bg-blue-500 rounded-[20px] flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-200">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-3">Course Management</h3>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-[200px]">
                  Select one of your assigned courses below to begin reviewing student submissions.
                </p>
              </div>

              {/* Right Side */}
              <div className="w-7/12 p-14 flex flex-col justify-center">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Select Assigned Course</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Building2 size={16} />
                      </div>
                      <select className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm">
                        <option value="">Choose Course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Student Level</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <GraduationCap size={16} />
                      </div>
                      <select className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm">
                        <option>Select Level</option>
                        <option>Level 200</option>
                        <option>Level 300</option>
                        <option>Level 400</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-between px-6 py-4 bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 mt-2">
                    <span>Proceed to Course Management</span>
                    <ChevronRight size={18} />
                  </button>
                  <p className="text-[9px] font-semibold text-slate-400 italic text-center pt-2">
                    * Selection will automatically load your assigned courses for this group.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={12} className="text-slate-400" />
                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Quick Access: Recent Selections</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-5">
                {recentSelections.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex justify-between items-center mb-4">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-extrabold tracking-wider">
                        {item.level}
                      </span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 truncate tracking-tight">{item.dept}</p>
                      <p className="text-[9px] font-semibold text-slate-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-10 py-8 shrink-0 flex justify-between items-center bg-[#fafafa]">
          <p className="text-[10px] font-semibold text-slate-400">
            © 2024 ACADSUBMIT Academic Management System.
          </p>
          <div className="flex gap-6 text-[10px] font-semibold text-slate-400">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Support Center</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LecturerCoursesPage;
